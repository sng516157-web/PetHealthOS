import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_PER_HOUR = 6;

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

function hashCode(phone: string, code: string): string {
  return createHmac("sha256", secret()).update(`${phone}.${code}`).digest("hex");
}

// Keep a leading + and digits only; collapse spaces/dashes/parens.
export function normalizePhone(input: string): string {
  const trimmed = input.trim();
  const plus = trimmed.startsWith("+") ? "+" : "";
  return plus + trimmed.replace(/[^\d]/g, "");
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, "");
  return digits.length >= 6 && digits.length <= 15;
}

// Pluggable SMS delivery. Twilio works with just credentials; China providers
// (Aliyun/Tencent) are wired as stubs to fill in when you have an account.
// With no provider configured we log the code (dev) so the flow is testable.
async function deliverSms(phone: string, text: string): Promise<"sent" | "dev"> {
  if (
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM
  ) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString(
      "base64",
    );
    const body = new URLSearchParams({
      To: phone,
      From: process.env.TWILIO_FROM,
      Body: text,
    });
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      },
    );
    if (!res.ok) throw new Error(`Twilio send failed: ${res.status}`);
    return "sent";
  }

  // TODO: Aliyun / Tencent Cloud SMS for the China market — add when credentials
  // are available (ALIYUN_SMS_* / TENCENT_SMS_*). Until then, fall through.

  console.log(`[sms:dev] OTP for ${phone}: ${text}`);
  return "dev";
}

export type OtpRequestResult =
  | { ok: true; devCode?: string }
  | { error: string };

export async function requestOtp(phone: string): Promise<OtpRequestResult> {
  if (!isValidPhone(phone)) return { error: "INVALID_PHONE" };

  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.phoneOtp.count({
    where: { phone, createdAt: { gte: since } },
  });
  if (recent >= MAX_PER_HOUR) return { error: "TOO_MANY_REQUESTS" };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.phoneOtp.create({
    data: {
      phone,
      codeHash: hashCode(phone, code),
      expiresAt: new Date(Date.now() + CODE_TTL_MS),
    },
  });

  const mode = await deliverSms(
    phone,
    `Pet Health OS verification code: ${code} (valid 10 min)`,
  );

  // Surface the code only in dev when no real provider sent it.
  if (mode === "dev" && process.env.NODE_ENV !== "production") {
    return { ok: true, devCode: code };
  }
  return { ok: true };
}

export type OtpVerifyResult = { ok: true } | { error: string };

export async function verifyOtp(
  phone: string,
  code: string,
  opts?: { consume?: boolean },
): Promise<OtpVerifyResult> {
  const otp = await prisma.phoneOtp.findFirst({
    where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return { error: "CODE_EXPIRED" };

  if (otp.attempts >= MAX_VERIFY_ATTEMPTS) return { error: "TOO_MANY_ATTEMPTS" };
  await prisma.phoneOtp.update({
    where: { id: otp.id },
    data: { attempts: { increment: 1 } },
  });

  const expected = Buffer.from(otp.codeHash, "hex");
  const candidate = Buffer.from(hashCode(phone, code.trim()), "hex");
  const match =
    expected.length === candidate.length && timingSafeEqual(expected, candidate);
  if (!match) return { error: "CODE_INVALID" };

  // Skip consuming when we only need to authenticate (e.g. a single-device
  // conflict pre-check), so the same code still works on the forced retry.
  if (opts?.consume !== false) {
    await prisma.phoneOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
  }
  return { ok: true };
}
