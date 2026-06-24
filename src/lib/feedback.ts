import { randomUUID } from "crypto";
import { sendEmail } from "./email";

export const FEEDBACK_PATH = "/feedback";

/** Operator inbox — server-only; never rendered in the UI. */
export function feedbackInboxEmail(): string | null {
  const v = process.env.FEEDBACK_INBOX_EMAIL?.trim();
  return v || null;
}

export function newFeedbackId(): string {
  return randomUUID();
}

export async function deliverFeedback(opts: {
  id: string;
  email: string;
  name?: string | null;
  message: string;
  locale?: string;
  userId?: string | null;
  orgId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const to = feedbackInboxEmail();
  if (!to) {
    console.error("[feedback] FEEDBACK_INBOX_EMAIL not set");
    return { ok: false, error: "FEEDBACK_NOT_CONFIGURED" };
  }

  const nameLine = opts.name?.trim() ? opts.name.trim() : "(not provided)";
  const meta = [
    opts.userId ? `User ID: ${opts.userId}` : null,
    opts.orgId ? `Org ID: ${opts.orgId}` : null,
    opts.locale ? `Locale: ${opts.locale}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const text = [
    `Feedback ID: ${opts.id}`,
    `From: ${opts.email}`,
    `Name: ${nameLine}`,
    meta,
    "",
    "Message:",
    opts.message.trim(),
  ]
    .filter((line) => line !== "")
    .join("\n");

  const html = `
    <p><strong>Feedback ID:</strong> ${opts.id}</p>
    <p><strong>From:</strong> ${escapeHtml(opts.email)}</p>
    <p><strong>Name:</strong> ${escapeHtml(nameLine)}</p>
    ${meta ? `<pre style="font-size:12px;color:#666">${escapeHtml(meta)}</pre>` : ""}
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap">${escapeHtml(opts.message.trim())}</p>
  `.trim();

  const res = await sendEmail({
    to,
    subject: `[PawSure feedback ${opts.id.slice(0, 8)}] from ${opts.email}`,
    text,
    html,
    replyTo: opts.email,
  });

  if (!res.ok) {
    console.error("[feedback] send failed:", res.error);
    return { ok: false, error: "SEND_FAILED" };
  }
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
