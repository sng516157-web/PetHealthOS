import { prisma } from "@/lib/prisma";
import { SEVERITY_META, type Severity } from "@/lib/constants";
import { summarizeHealthWatch } from "@/lib/ai";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;
// Only pets touched within this window are even scanned. It's slightly wider
// than the daily cron interval so we never miss a day's activity, but it means
// dormant pets (the vast majority on any given day) are skipped entirely — no
// query work and, crucially, no AI.
const ACTIVITY_WINDOW_DAYS = 2;
// Hard ceiling on AI calls per run as a cost backstop. In practice far fewer
// run because of the activity + new-evidence gates below.
const MAX_AI = 25;

// The guardian: a daily scan that turns anomaly signals (serious recent entry,
// weight drop, a cluster of concerns) into a proactive "worth a look" in-app
// notification for the pet's caretaker (owner if claimed, else the shop). The AI
// only phrases what the rules already detected — it never invents findings.
//
// Cost control — analysis runs ONLY when needed:
//   1. Activity gate: skip pets with no new log/weight in the last few days.
//   2. New-evidence gate: a signal only counts if it's backed by data created
//      AFTER the last watch alert, so we never re-analyse (or re-notify) the
//      same situation. AI is therefore invoked only on genuinely new concerns.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const now = Date.now();
  const rank = (s: string) => SEVERITY_META[s as Severity]?.rank ?? 0;
  const activitySince = new Date(now - ACTIVITY_WINDOW_DAYS * DAY);

  // Activity gate: only pull pets that actually logged something or recorded a
  // weight recently. Everything else can't have a *new* signal, so there's
  // nothing to analyse.
  const pets = await prisma.pet.findMany({
    where: {
      status: { in: ["ACTIVE", "UNDER_OBSERVATION"] },
      OR: [
        { logs: { some: { createdAt: { gte: activitySince } } } },
        { weights: { some: { createdAt: { gte: activitySince } } } },
      ],
    },
    select: {
      id: true,
      name: true,
      species: true,
      breed: true,
      sex: true,
      birthDate: true,
      weightKg: true,
      notes: true,
      orgId: true,
      ownerUserId: true,
      logs: {
        where: { occurredAt: { gte: new Date(now - 30 * DAY) } },
        orderBy: { occurredAt: "desc" },
      },
      weights: {
        where: { measuredAt: { gte: new Date(now - 30 * DAY) } },
        orderBy: { measuredAt: "asc" },
      },
    },
  });

  let created = 0;
  let aiUsed = 0;
  let analysed = 0;

  for (const pet of pets) {
    // One caretaker per pet: the owner once claimed, otherwise the shop.
    const recipient: { orgId?: string | null; userId?: string | null } | null =
      pet.ownerUserId
        ? { userId: pet.ownerUserId }
        : pet.orgId
          ? { orgId: pet.orgId }
          : null;
    if (!recipient) continue;

    // New-evidence baseline: only evidence created after our last alert counts.
    // This replaces a fixed timer — the same concern is never re-analysed, but a
    // genuinely new/worse sign gets through immediately.
    const lastWatch = await prisma.notification.findFirst({
      where: {
        petId: pet.id,
        kind: "WATCH",
        orgId: recipient.orgId ?? null,
        userId: recipient.userId ?? null,
      },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });
    const since = lastWatch?.createdAt.getTime() ?? 0;
    const isNew = (d: Date) => d.getTime() > since;

    // ---- Rule-based anomaly detection (each signal requires NEW evidence) ----
    const signals: string[] = [];
    let title: string | null = null;

    const serious = pet.logs.filter(
      (l) =>
        l.occurredAt.getTime() > now - 7 * DAY &&
        rank(l.severity) >= 3 &&
        isNew(l.createdAt),
    );
    if (serious.length > 0) {
      signals.push(
        `Serious sign logged in the last week: ${serious
          .map((l) => l.title || l.type)
          .slice(0, 3)
          .join(", ")}`,
      );
      title = `${pet.name}: a recent entry needs attention`;
    }

    if (pet.weights.length >= 2) {
      const first = pet.weights[0];
      const last = pet.weights[pet.weights.length - 1];
      const spanDays = (last.measuredAt.getTime() - first.measuredAt.getTime()) / DAY;
      // Only re-evaluate the trend when a *new* weight reading has arrived.
      if (isNew(last.createdAt) && spanDays >= 5 && last.weightKg < first.weightKg) {
        const dropPct = Math.round(
          ((first.weightKg - last.weightKg) / first.weightKg) * 100,
        );
        if (dropPct >= 10) {
          signals.push(
            `Weight down ~${dropPct}% (${first.weightKg}kg → ${last.weightKg}kg) over ~${Math.round(spanDays)} days`,
          );
          if (!title) title = `${pet.name}: weight dropped ~${dropPct}%`;
        }
      }
    }

    const mediumPlus = pet.logs.filter(
      (l) => l.occurredAt.getTime() > now - 14 * DAY && rank(l.severity) >= 2,
    );
    // Need the cluster AND at least one fresh entry since the last alert.
    if (!title && mediumPlus.length >= 2 && mediumPlus.some((l) => isNew(l.createdAt))) {
      signals.push(`${mediumPlus.length} notable entries in the last two weeks`);
      title = `${pet.name}: a few things worth watching`;
    }

    if (!title || signals.length === 0) continue;
    analysed++;

    // ---- Message body: AI-phrased (capped) with a template fallback ----
    let body = `${signals.join(". ")}. Keep an eye on it and check with a vet if it persists or worsens.`;
    if (aiUsed < MAX_AI) {
      const aiNote = await summarizeHealthWatch({
        pet,
        signals,
        recentLogs: pet.logs,
      });
      if (aiNote) {
        body = aiNote;
        aiUsed++;
      }
    }

    await prisma.notification.create({
      data: {
        petId: pet.id,
        orgId: recipient.orgId ?? null,
        userId: recipient.userId ?? null,
        kind: "WATCH",
        title,
        body,
      },
    });
    created++;
  }

  return Response.json({
    ok: true,
    scanned: pets.length,
    analysed,
    created,
    aiUsed,
  });
}
