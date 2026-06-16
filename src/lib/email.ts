// Minimal transactional email via Resend's REST API — no SDK dependency, and
// fully gated behind RESEND_API_KEY so everything works without it.

export type SendEmailResult = { ok: true } | { ok: false; error: string };

/** Resend expects `Name <email@domain.com>` — no surrounding JSON-style quotes. */
export function normalizeResendFrom(raw: string | undefined): string {
  let from = (raw ?? "PawSure <onboarding@resend.dev>").trim();
  // Vercel/dashboard copy-paste often wraps the whole value in extra quotes.
  if (
    (from.startsWith('"') && from.endsWith('"')) ||
    (from.startsWith("'") && from.endsWith("'"))
  ) {
    from = from.slice(1, -1).trim();
  }
  return from;
}

export async function sendEmail(msg: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}): Promise<SendEmailResult> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, error: "RESEND_API_KEY not set" };
  const from = normalizeResendFrom(process.env.RESEND_FROM);
  try {
    const payload: Record<string, unknown> = {
      from,
      to: msg.to,
      subject: msg.subject,
      text: msg.text,
    };
    if (msg.html) payload.html = msg.html;
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (res.ok) return { ok: true };
    const errBody = await res.text();
    console.error("[email] Resend API error", res.status, errBody);
    return { ok: false, error: `Resend ${res.status}: ${errBody.slice(0, 200)}` };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[email] Resend fetch failed", message);
    return { ok: false, error: message };
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
  const res = await sendEmail({ to, subject, text });
  if (!res.ok) console.error("[email] notifyAdmins failed:", res.error);
}
