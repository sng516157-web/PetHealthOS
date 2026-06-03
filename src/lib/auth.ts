import { cache } from "react";
import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";

const COOKIE = "ph_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return (
    expected.length === candidate.length && timingSafeEqual(expected, candidate)
  );
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

// Token carries userId + a session id (sid) + expiry. The sid lets us enforce
// single-device sessions for owner accounts (shops ignore it / are multi-device).
function makeToken(userId: string, sid: string, expMs: number): string {
  const body = Buffer.from(`${userId}.${sid}.${expMs}`).toString("base64url");
  return `${body}.${sign(body)}`;
}

function readToken(
  token: string,
): { userId: string; sid: string | null } | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  const parts = Buffer.from(body, "base64url").toString().split(".");
  // New format: userId.sid.exp · legacy format: userId.exp
  let userId: string | undefined;
  let sid: string | null = null;
  let expStr: string | undefined;
  if (parts.length === 3) [userId, sid, expStr] = parts;
  else if (parts.length === 2) [userId, expStr] = parts;
  else return null;
  if (!userId || !expStr || Number(expStr) < Date.now()) return null;
  return { userId, sid };
}

// Start a session. For owner accounts pass { single: true } to also record the
// active session server-side so other devices are kicked.
export async function setSession(
  userId: string,
  opts?: { single?: boolean },
): Promise<void> {
  const sid = randomBytes(16).toString("hex");
  const expMs = Date.now() + MAX_AGE * 1000;
  if (opts?.single) {
    await prisma.user.update({
      where: { id: userId },
      data: { sessionId: sid, sessionExpiresAt: new Date(expMs) },
    });
  }
  const store = await cookies();
  store.set(COOKIE, makeToken(userId, sid, expMs), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

// Drop the server-side single-device session (owner sign-out), so a later login
// doesn't see a stale "active elsewhere" state.
export async function clearUserSession(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { sessionId: null, sessionExpiresAt: null },
    });
  } catch {
    // best-effort
  }
}

// Is this account currently signed in on a device (an unexpired single-device
// session exists)? Used to offer the "kick other device" choice on login.
export function hasActiveSession(user: {
  sessionId: string | null;
  sessionExpiresAt: Date | null;
}): boolean {
  return Boolean(
    user.sessionId &&
      user.sessionExpiresAt &&
      user.sessionExpiresAt.getTime() > Date.now(),
  );
}

// Memoized per request: the /me layout and page both resolve the user, so this
// shares one cookie read + DB lookup instead of repeating it.
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const parsed = readToken(token);
  if (!parsed) return null;
  const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
  if (!user) return null;
  // Single-device enforcement for owner accounts: the cookie's session id must
  // match the active one, else this device was kicked. Shops are multi-device.
  if (!user.orgId && user.sessionId && user.sessionId !== parsed.sid) {
    return null;
  }
  return user;
});
