import type { Locale } from "./config";

/** Mainland China, Hong Kong, Macau — default UI language zh. */
export const CHINA_REGION_CODES = new Set(["CN", "HK", "MO"]);

export function localeForCountry(country: string | null | undefined): Locale {
  const code = (country ?? "").trim().toUpperCase();
  return CHINA_REGION_CODES.has(code) ? "zh" : "en";
}

/** Vercel / Cloudflare / generic CDN country headers. */
export function countryFromHeaders(
  headers: Headers | { get(name: string): string | null },
): string | null {
  return (
    headers.get("x-vercel-ip-country") ??
    headers.get("cf-ipcountry") ??
    headers.get("x-country-code") ??
    null
  );
}

export function localeFromHeaders(
  headers: Headers | { get(name: string): string | null },
): Locale {
  return localeForCountry(countryFromHeaders(headers));
}
