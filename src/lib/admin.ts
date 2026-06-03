import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { getCurrentUser } from "./auth";
import { adminEmails } from "./email";

// Admin (PawSure review team) access. Two ways in, both optional:
//  1. ADMIN_PASSWORD — a shared password that sets a signed admin cookie. This
//     is the practical path while there are no per-person team accounts yet.
//  2. ADMIN_EMAILS — a logged-in user whose email is on the list is an admin.
// If neither env var is set, the admin area is effectively closed.

const COOKIE = "ph_admin";
const MAX_AGE = 60 * 60 * 12; // 12 hours

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-insecure-secret-change-me";
}

function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

function adminToken(): string {
  const body = Buffer.from(`admin.${Date.now() + MAX_AGE * 1000}`).toString(
    "base64url",
  );
  return `${body}.${sign(body)}`;
}

function validToken(token: string): boolean {
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = sign(body);
  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return false;
  }
  const [, expStr] = Buffer.from(body, "base64url").toString().split(".");
  return Boolean(expStr) && Number(expStr) > Date.now();
}

export function passwordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

// True when the current request belongs to a reviewer.
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (token && validToken(token)) return true;

  const emails = adminEmails();
  if (emails.length > 0) {
    const user = await getCurrentUser();
    if (user?.email && emails.includes(user.email.toLowerCase())) return true;
  }
  return false;
}

// Verify the shared admin password (constant-time) and start an admin session.
export async function adminSignIn(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const store = await cookies();
  store.set(COOKIE, adminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function adminSignOut(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
