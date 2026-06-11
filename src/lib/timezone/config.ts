export const TIMEZONE_COOKIE = "tz";
export const DEFAULT_TIMEZONE = "UTC";

/** Validate an IANA timezone name (e.g. Asia/Shanghai). */
export function isValidTimezone(tz: string | undefined | null): tz is string {
  if (!tz || tz.length > 64) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
