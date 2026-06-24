import "server-only";
import { cookies } from "next/headers";
import { FOUNDING_INTENT_COOKIE } from "./founding-intent";

export async function hasFoundingIntent(): Promise<boolean> {
  return (await cookies()).get(FOUNDING_INTENT_COOKIE)?.value === "1";
}

export async function clearFoundingIntentCookie(): Promise<void> {
  (await cookies()).delete(FOUNDING_INTENT_COOKIE);
}
