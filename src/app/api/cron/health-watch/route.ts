import { prisma } from "@/lib/prisma";
import { SEVERITY_META, type Severity } from "@/lib/constants";
import { summarizeHealthWatch } from "@/lib/ai";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;
// Don't re-nudge about the same pet more often than this.
const DEDUPE_DAYS = 3;
// Bound AI cost per run — only the first N flagged pets get an AI-written note;
// the rest fall back to the deterministic template.
const MAX_AI = 25;

// The guardian: a daily scan that turns anomaly signals (serious recent entry,
// weight drop, a cluster of concerns) into a proactive "worth a look" in-app
// notification for the pet's caretaker (owner if claimed, else the shop). The AI
// only phrases what the rules already detected — it never invents findings.
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

  const pets = await prisma.pet.findMany({
    where: { status: { in: ["ACTIVE", "UNDER_OBSERVATION"] } },
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

  for (const pet of pets) {
    // One caretaker per pet: the owner once claimed, otherwise the shop.
    const recipient: { orgId?: string | null; userId?: string | null } | null =
      pet.ownerUserId
        ? { userId: pet.ownerUserId }
        : pet.orgId
          ? { orgId: pet.orgId }
          : null;
    if (!recipient) continue;

    // Dedupe: skip if we already nudged this pet+caretaker recently.
    const recent = await prisma.notification.findFirst({
      where: {
        petId: pet.id,
        kind: "WATCH",
        orgId: recipient.orgId ?? null,
        userId: recipient.userId ?? null,
        createdAt: { gte: new Date(now - DEDUPE_DAYS * DAY) },
      },
      select: { id: true },
    });
    if (recent) continue;

    // ---- Rule-based anomaly detection ----
    const signals: string[] = [];
    let title: string | null = null;

    const serious = pet.logs.filter(
      (l) => l.occurredAt.getTime() > now - 7 * DAY && rank(l.severity) >= 3,
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
      if (spanDays >= 5 && last.weightKg < first.weightKg) {
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
    if (!title && mediumPlus.length >= 2) {
      signals.push(`${mediumPlus.length} notable entries in the last two weeks`);
      title = `${pet.name}: a few things worth watching`;
    }

    if (!title || signals.length === 0) continue;

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

  return Response.json({ ok: true, scanned: pets.length, created, aiUsed });
}
