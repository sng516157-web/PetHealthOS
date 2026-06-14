import { createHmac, randomBytes } from "crypto";
import { headers } from "next/headers";
import { prisma } from "./prisma";
import { sendEmail } from "./email";
import { canonicalAppUrl } from "./site-url";
import type { Locale } from "./i18n/config";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_SENDS_PER_HOUR = 5;

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

function hashToken(raw: string): string {
  return createHmac("sha256", secret()).update(`email-verify.${raw}`).digest("hex");
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

function copy(locale: Locale) {
  if (locale === "zh") {
    return {
      subject: "验证你的 PawSure 邮箱",
      text: (url: string) =>
        `请点击以下链接验证你的邮箱（24 小时内有效）：\n\n${url}\n\n如果你没有创建 PawSure 账号，请忽略此邮件。`,
    };
  }
  return {
    subject: "Verify your PawSure email",
    text: (url: string) =>
      `Click the link below to verify your email (valid for 24 hours):\n\n${url}\n\nIf you didn't create a PawSure account, you can ignore this message.`,
  };
}

export type SendVerificationResult =
  | { ok: true; devLink?: string }
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
  await prisma.emailVerification.create({
    data: {
      userId,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const base = await publicAppBaseUrl();
  const url = `${base}/verify-email/confirm?token=${encodeURIComponent(raw)}`;
  const { subject, text } = copy(locale);

  if (!process.env.RESEND_API_KEY) {
    console.log(`[email:dev] Verification link for ${email}: ${url}`);
    if (process.env.NODE_ENV !== "production") return { ok: true, devLink: url };
    return { error: "EMAIL_NOT_CONFIGURED" };
  }

  const sent = await sendEmail({ to: email, subject, text: text(url) });
  if (!sent) return { error: "SEND_FAILED" };
  return { ok: true };
}

export type ConfirmVerificationResult =
  | { ok: true; userId: string; accountType: "owner" | "shop" | "facility" }
  | { error: string };

export async function confirmEmailVerification(
  rawToken: string,
): Promise<ConfirmVerificationResult> {
  const token = rawToken.trim();
  if (!token) return { error: "TOKEN_MISSING" };

  const match = await prisma.emailVerification.findFirst({
    where: {
      tokenHash: hashToken(token),
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    include: {
      user: { select: { id: true, orgId: true, org: { select: { kind: true } } } },
    },
  });
  if (!match) return { error: "TOKEN_INVALID" };

  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({
      where: { id: match.userId },
      data: { emailVerifiedAt: now },
    }),
    prisma.emailVerification.update({
      where: { id: match.id },
      data: { consumedAt: now },
    }),
  ]);

  const user = match.user;
  let accountType: "owner" | "shop" | "facility" = "owner";
  if (user.orgId) {
    accountType =
      user.org?.kind === "HOSPITAL" || user.org?.kind === "BOARDING"
        ? "facility"
        : "shop";
  }

  return { ok: true, userId: user.id, accountType };
}
