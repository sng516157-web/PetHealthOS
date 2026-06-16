import { createHmac, randomBytes, randomInt } from "crypto";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { canonicalAppUrl } from "./site-url";
import type { Locale } from "./i18n/config";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;
const MAX_CODE_ATTEMPTS = 10;

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

function hashToken(raw: string): string {
  return createHmac("sha256", secret()).update(`email-verify.${raw}`).digest("hex");
}

function hashCode(raw: string): string {
  return createHmac("sha256", secret()).update(`email-verify-code.${raw}`).digest("hex");
}

function generateCode(): string {
  return String(randomInt(100000, 1000000));
}

export function needsEmailVerification(user: {
  email: string | null;
  emailVerifiedAt?: Date | null;
}): boolean {
  return Boolean(user.email && !user.emailVerifiedAt);
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
      subject: "验证你的 PawSure 邮箱",
      text: (url, code) =>
        `你的验证码：${code}\n\n或点击链接验证（24 小时内有效）：\n${url}\n\n如果你没有创建 PawSure 账号，请忽略此邮件。`,
      html: (url, code) => verificationHtml({
        locale: "zh",
        code,
        url,
        title: "验证你的 PawSure 邮箱",
        codeLabel: "验证码",
        button: "验证邮箱",
        linkHint: "或复制链接到浏览器：",
        footer: "如果你没有创建 PawSure 账号，请忽略此邮件。",
      }),
    };
  }
  return {
    subject: "Verify your PawSure email",
    text: (url, code) =>
      `Your verification code: ${code}\n\nOr click the link (valid 24 hours):\n${url}\n\nIf you didn't create a PawSure account, you can ignore this message.`,
    html: (url, code) =>
      verificationHtml({
        locale: "en",
        code,
        url,
        title: "Verify your PawSure email",
        codeLabel: "Verification code",
        button: "Verify email",
        linkHint: "Or copy this link into your browser:",
        footer: "If you didn't create a PawSure account, you can ignore this message.",
      }),
  };
}

function verificationHtml(opts: {
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

export type SendVerificationResult =
  | { ok: true; devLink?: string; devCode?: string }
  | { error: string };

export async function sendVerificationEmail(
  userId: string,
  email: string,
  locale: Locale = "en",
): Promise<SendVerificationResult> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.emailVerification.count({
    where: { userId, createdAt: { gte: since } },
  });
  if (recent >= MAX_SENDS_PER_HOUR) return { error: "TOO_MANY_REQUESTS" };

  const raw = randomBytes(32).toString("base64url");
  const code = generateCode();
  await prisma.emailVerification.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const base = await publicAppBaseUrl();
  const url = `${base}/verify-email/confirm?token=${encodeURIComponent(raw)}`;
  const { subject, text, html } = copy(locale);

  if (!process.env.RESEND_API_KEY) {
    console.log(`[email:dev] Verification for ${email}: code=${code} link=${url}`);
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, devLink: url, devCode: code };
    }
    return { error: "EMAIL_NOT_CONFIGURED" };
  }

  const sent = await sendEmail({
    to: email,
    subject,
    text: text(url, code),
    html: html(url, code),
  });
  if (!sent.ok) return { error: "SEND_FAILED" };
  return { ok: true };
}

export type ConfirmVerificationResult =
  | { ok: true; userId: string; accountType: "owner" | "shop" | "facility" }
  | { error: string };

type VerifyUser = {
  id: string;
  orgId: string | null;
  emailVerifiedAt: Date | null;
  org: { kind: string } | null;
};

async function applyEmailVerified(user: VerifyUser, verificationId: string): Promise<void> {
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: now },
    });
    await tx.emailVerification.update({
      where: { id: verificationId },
      data: { consumedAt: now },
    });
  });
}

export async function confirmEmailVerification(
  rawToken: string,
): Promise<ConfirmVerificationResult> {
  const token = rawToken.trim();
  if (!token) return { error: "TOKEN_MISSING" };

  const match = await prisma.emailVerification.findFirst({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          orgId: true,
          emailVerifiedAt: true,
          org: { select: { kind: true } },
        },
      },
    },
  });
  if (!match) return { error: "TOKEN_INVALID" };

  const accountType = accountTypeForUser(match.user);

  if (match.consumedAt && match.user.emailVerifiedAt) {
    return { ok: true, userId: match.user.id, accountType };
  }

  if (match.consumedAt || match.expiresAt.getTime() <= Date.now()) {
    return { error: "TOKEN_INVALID" };
  }

  await applyEmailVerified(match.user, match.id);
  return { ok: true, userId: match.user.id, accountType };
}

export async function confirmEmailVerificationByCode(
  userId: string,
  rawCode: string,
): Promise<ConfirmVerificationResult> {
  const code = rawCode.trim().replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: "CODE_INVALID" };

  const active = await prisma.emailVerification.findMany({
    where: {
      userId,
      consumedAt: null,
      expiresAt: { gt: new Date() },
      codeHash: { not: null },
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          orgId: true,
          emailVerifiedAt: true,
          org: { select: { kind: true } },
        },
      },
    },
  });

  const hashed = hashCode(code);
  const match = active.find((row) => row.codeHash === hashed);

  if (!match) {
    const latest = active[0];
    if (latest) {
      const attempts = latest.codeAttempts + 1;
      await prisma.emailVerification.update({
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

  if (match.user.emailVerifiedAt) {
    return {
      ok: true,
      userId: match.user.id,
      accountType: accountTypeForUser(match.user),
    };
  }

  await applyEmailVerified(match.user, match.id);
  return {
    ok: true,
    userId: match.user.id,
    accountType: accountTypeForUser(match.user),
  };
}

/** Admin/support: mark an account verified without the magic link. */
export async function markEmailVerifiedByAdmin(userId: string): Promise<{ ok: true } | { error: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, emailVerifiedAt: true },
  });
  if (!user?.email) return { error: "NO_EMAIL" };
  if (user.emailVerifiedAt) return { ok: true };

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: now },
    });
    await tx.emailVerification.updateMany({
      where: { userId, consumedAt: null },
      data: { consumedAt: now },
    });
  });
  return { ok: true };
}

export async function listUnverifiedSignups(limit = 50) {
  return prisma.user.findMany({
    where: { email: { not: null }, emailVerifiedAt: null },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      orgId: true,
      org: { select: { name: true, kind: true } },
      _count: { select: { emailVerifications: true } },
    },
  });
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
