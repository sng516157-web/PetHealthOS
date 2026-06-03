// Minimal transactional email via Resend's REST API — no SDK dependency, and
// fully gated behind RESEND_API_KEY so everything works without it.

export async function sendEmail(msg: {
  to: string | string[];
  subject: string;
  text: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  const from = process.env.RESEND_FROM ?? "PawSure <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: msg.to, subject: msg.subject, text: msg.text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Comma-separated list of reviewer emails (the PawSure team).
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Best-effort ping to the review team when something needs attention. No-op if
// no reviewer emails or no email provider is configured (team can still use the
// /admin queue).
export async function notifyAdmins(subject: string, text: string): Promise<void> {
  const to = adminEmails();
  if (to.length === 0) return;
  await sendEmail({ to, subject, text });
}
