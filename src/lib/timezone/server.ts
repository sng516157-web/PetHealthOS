import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_TIMEZONE, TIMEZONE_COOKIE, isValidTimezone } from "./config";

export async function getTimezone(): Promise<string> {
  const store = await cookies();
  const value = store.get(TIMEZONE_COOKIE)?.value;
  return isValidTimezone(value) ? value : DEFAULT_TIMEZONE;
}
