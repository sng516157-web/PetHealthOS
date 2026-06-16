import { createHmac, randomBytes, randomInt } from "crypto";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { hashPassword } from "./auth";
import { canonicalAppUrl } from "./site-url";
import type { Locale } from "./i18n/config";

const TOKEN_TTL_MS = 60 * 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_CODE_ATTEMPTS = 10;

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

function hashToken(raw: string): string {
  return createHmac("sha256", secret()).update(`password-reset.${raw}`).digest("hex");
}

function hashCode(raw: string): string {
  return createHmac("sha256", secret())
    .update(`password-reset-code.${raw}`)
    .digest("hex");
}

function generateCode(): string {
  return String(randomInt(100000, 1000000));
}

async function publicAppBaseUrl(): Promise<string> {
  const canonical = canonicalAppUrl();
  if (canonical) return canonical;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  return `${proto}://${host}`;
}

type EmailCopy = {
  subject: string;
  text: (url: string, code: string) => string;
  html: (url: string, code: string) => string;
};

function copy(locale: Locale): EmailCopy {
  if (locale === "zh") {
    return {
      subject: "重置你的 PawSure 密码",
      text: (url, code) =>
        `你的验证码：${code}\n\n或点击链接重置密码（1 小时内有效）：\n${url}\n\n如果你没有请求重置密码，请忽略此邮件。`,
      html: (url, code) =>
        resetHtml({
          locale: "zh",
          code,
          url,
          title: "重置你的 PawSure 密码",
          codeLabel: "验证码",
          button: "重置密码",
          linkHint: "或复制链接到浏览器：",
          footer: "如果你没有请求重置密码，请忽略此邮件。",
        }),
    };
  }
  return {
    subject: "Reset your PawSure password",
    text: (url, code) =>
      `Your reset code: ${code}\n\nOr click the link (valid for 1 hour):\n${url}\n\nIf you didn't request a password reset, you can ignore this message.`,
    html: (url, code) =>
      resetHtml({
        locale: "en",
        code,
        url,
        title: "Reset your PawSure password",
        codeLabel: "Reset code",
        button: "Reset password",
        linkHint: "Or copy this link into your browser:",
        footer: "If you didn't request a password reset, you can ignore this message.",
      }),
  };
}

function resetHtml(opts: {
  locale: Locale;
  code: string;
  url: string;
  title: string;
  codeLabel: string;
  button: string;
  linkHint: string;
  footer: string;
}): string {
  const { code, url, title, codeLabel, button, linkHint, footer } = opts;
  return `<!DOCTYPE html>
<html lang="${opts.locale === "zh" ? "zh" : "en"}">
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f5f0;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:16px;border:1px solid #e8e4dc;padding:32px 28px;">
        <tr><td style="text-align:center;padding-bottom:8px;">
          <div style="font-size:20px;font-weight:700;color:#1a3d2e;">PawSure</div>
        </td></tr>
        <tr><td style="text-align:center;font-size:16px;font-weight:600;color:#1a3d2e;padding-bottom:16px;">${title}</td></tr>
        <tr><td style="text-align:center;padding:12px 0 20px;">
          <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">${codeLabel}</div>
          <div style="font-size:32px;font-weight:700;letter-spacing:6px;color:#1a3d2e;font-family:ui-monospace,monospace;">${code}</div>
        </td></tr>
        <tr><td align="center" style="padding-bottom:24px;">
          <a href="${url}" style="display:inline-block;background:#2d6a4f;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 28px;border-radius:12px;">${button}</a>
        </td></tr>
        <tr><td style="font-size:12px;color:#6b7280;line-height:1.5;padding-bottom:8px;">${linkHint}</td></tr>
        <tr><td style="font-size:11px;color:#9ca3af;word-break:break-all;line-height:1.4;">${url}</td></tr>
        <tr><td style="font-size:11px;color:#9ca3af;line-height:1.5;padding-top:24px;border-top:1px solid #f0ebe3;margin-top:24px;">${footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export type SendPasswordResetResult =
  | { ok: true; devLink?: string; devCode?: string }
  | { error: string };

/** Always call when email format is valid — returns ok even if account missing (no enumeration). */
export async function sendPasswordResetEmail(
  email: string,
  locale: Locale = "en",
): Promise<SendPasswordResetResult> {
  const user = await prisma.user.findFirst({
    where: { email: { equals: email.trim().toLowerCase(), mode: "insensitive" } },
    select: { id: true, email: true, passwordHash: true },
  });
  if (!user?.email || !user.passwordHash) return { ok: true };

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.passwordReset.count({
    where: { userId: user.id, createdAt: { gte: since } },
  });
  if (recent >= MAX_SENDS_PER_HOUR) return { error: "TOO_MANY_REQUESTS" };

  const raw = randomBytes(32).toString("base64url");
  const code = generateCode();
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(raw),
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const base = await publicAppBaseUrl();
  const url = `${base}/reset-password?token=${encodeURIComponent(raw)}`;
  const { subject, text, html } = copy(locale);

  if (!process.env.RESEND_API_KEY) {
    console.log(`[email:dev] Password reset for ${user.email}: code=${code} link=${url}`);
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, devLink: url, devCode: code };
    }
    return { error: "EMAIL_NOT_CONFIGURED" };
  }

  const sent = await sendEmail({
    to: user.email,
    subject,
    text: text(url, code),
    html: html(url, code),
  });
  if (!sent.ok) return { error: "SEND_FAILED" };
  return { ok: true };
}

export type ResetPasswordResult =
  | { ok: true; userId: string; accountType: "owner" | "shop" | "facility" }
  | { error: string };

type ResetUser = {
  id: string;
  orgId: string | null;
  org: { kind: string } | null;
};

async function findResetByToken(token: string) {
  return prisma.passwordReset.findFirst({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          orgId: true,
          passwordHash: true,
          org: { select: { kind: true } },
        },
      },
    },
  });
}

export async function validatePasswordResetToken(
  rawToken: string,
): Promise<{ ok: true } | { error: string }> {
  const token = rawToken.trim();
  if (!token) return { error: "TOKEN_MISSING" };
  const match = await findResetByToken(token);
  if (!match || match.consumedAt || match.expiresAt.getTime() <= Date.now()) {
    return { error: "TOKEN_INVALID" };
  }
  if (!match.user.passwordHash) return { error: "TOKEN_INVALID" };
  return { ok: true };
}

async function applyPasswordReset(
  user: ResetUser,
  resetId: string,
  newPassword: string,
): Promise<void> {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(newPassword),
        sessionId: null,
        sessionExpiresAt: null,
      },
    });
    await tx.passwordReset.update({
      where: { id: resetId },
      data: { consumedAt: now },
    });
    await tx.passwordReset.updateMany({
      where: { userId: user.id, consumedAt: null, id: { not: resetId } },
      data: { consumedAt: now },
    });
  });
}

export async function resetPasswordWithToken(
  rawToken: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  const token = rawToken.trim();
  if (!token) return { error: "TOKEN_MISSING" };

  const match = await findResetByToken(token);
  if (!match) return { error: "TOKEN_INVALID" };
  if (match.consumedAt || match.expiresAt.getTime() <= Date.now()) {
    return { error: "TOKEN_INVALID" };
  }
  if (!match.user.passwordHash) return { error: "TOKEN_INVALID" };

  await applyPasswordReset(match.user, match.id, newPassword);
  return {
    ok: true,
    userId: match.user.id,
    accountType: accountTypeForUser(match.user),
  };
}

export async function resetPasswordWithCode(
  email: string,
  rawCode: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  const code = rawCode.trim().replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "CODE_INVALID" };

  const user = await prisma.user.findFirst({
    where: { email: { equals: email.trim().toLowerCase(), mode: "insensitive" } },
    select: {
      id: true,
      orgId: true,
      passwordHash: true,
      org: { select: { kind: true } },
    },
  });
  if (!user?.passwordHash) return { error: "CODE_INVALID" };

  const active = await prisma.passwordReset.findMany({
    where: {
      userId: user.id,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      codeHash: { not: null },
    },
    orderBy: { createdAt: "desc" },
  });

  const hashed = hashCode(code);
  const match = active.find((row) => row.codeHash === hashed);

  if (!match) {
    const latest = active[0];
    if (latest) {
      const attempts = latest.codeAttempts + 1;
      await prisma.passwordReset.update({
        where: { id: latest.id },
        data: { codeAttempts: attempts },
      });
      if (attempts >= MAX_CODE_ATTEMPTS) return { error: "TOO_MANY_ATTEMPTS" };
    }
    return { error: "CODE_INVALID" };
  }

  if (match.codeAttempts >= MAX_CODE_ATTEMPTS) {
    return { error: "TOO_MANY_ATTEMPTS" };
  }

  await applyPasswordReset(user, match.id, newPassword);
  return { ok: true, userId: user.id, accountType: accountTypeForUser(user) };
}

function accountTypeForUser(user: {
  orgId: string | null;
  org: { kind: string } | null;
}): "owner" | "shop" | "facility" {
  if (!user.orgId) return "owner";
  return user.org?.kind === "HOSPITAL" || user.org?.kind === "BOARDING"
    ? "facility"
    : "shop";
}
