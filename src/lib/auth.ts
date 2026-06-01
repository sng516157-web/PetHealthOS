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

function makeToken(userId: string): string {
  const exp = Date.now() + MAX_AGE * 1000;
  const body = Buffer.from(`${userId}.${exp}`).toString("base64url");
  return `${body}.${sign(body)}`;
}

function readToken(token: string): string | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  const [userId, expStr] = Buffer.from(body, "base64url").toString().split(".");
  if (!userId || !expStr || Number(expStr) < Date.now()) return null;
  return userId;
}

export async function setSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeToken(userId), {
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

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  const userId = readToken(token);
  if (!userId) return null;
  return prisma.user.findUnique({ where: { id: userId } });
}
