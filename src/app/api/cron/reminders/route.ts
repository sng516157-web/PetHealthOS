import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Daily job (see vercel.json crons): turn due/overdue reminders into in-app
// notifications for the breeder org and the consumer owner, and optionally
// email the owner when an email provider key is configured.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const now = new Date();
  const horizon = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const reminders = await prisma.reminder.findMany({
    where: { completed: false, dueAt: { lte: horizon } },
    include: {
      pet: { select: { id: true, name: true, orgId: true, ownerUserId: true } },
    },
  });

  let created = 0;
  const outbound: { to: string; subject: string; text: string }[] = [];

  for (const r of reminders) {
    const overdue = r.dueAt.getTime() < now.getTime();
    const recipients: { orgId?: string | null; userId?: string | null }[] = [];
    if (r.pet.orgId) recipients.push({ orgId: r.pet.orgId });
    if (r.pet.ownerUserId) recipients.push({ userId: r.pet.ownerUserId });

    for (const rec of recipients) {
      const exists = await prisma.notification.findFirst({
        where: {
          reminderId: r.id,
          orgId: rec.orgId ?? null,
          userId: rec.userId ?? null,
        },
      });
      if (exists) continue;

      await prisma.notification.create({
        data: {
          petId: r.pet.id,
          orgId: rec.orgId ?? null,
          userId: rec.userId ?? null,
          reminderId: r.id,
          kind: "REMINDER",
          title: `${overdue ? "Overdue" : "Due soon"}: ${r.title} — ${r.pet.name}`,
          body: r.notes ?? null,
          dueAt: r.dueAt,
        },
      });
      created++;

      if (rec.userId) {
        const u = await prisma.user.findUnique({
          where: { id: rec.userId },
          select: { email: true },
        });
        if (u?.email) {
          outbound.push({
            to: u.email,
            subject: `${r.pet.name}: ${r.title}`,
            text: `Reminder ${overdue ? "is overdue" : "due soon"}: "${r.title}" for ${r.pet.name} (due ${r.dueAt.toISOString().slice(0, 10)}).`,
          });
        }
      }
    }
  }

  // Optional email delivery via Resend's REST API — no SDK dependency, fully
  // gated behind RESEND_API_KEY so the app works without it.
  let emailed = 0;
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM ?? "Pet Health OS <onboarding@resend.dev>";
  if (resendKey) {
    for (const m of outbound) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ from, to: m.to, subject: m.subject, text: m.text }),
        });
        if (res.ok) emailed++;
      } catch {
        // best-effort; in-app notification already recorded
      }
    }
  }

  return Response.json({
    ok: true,
    scanned: reminders.length,
    created,
    emailed,
  });
}
