export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];

/** Fallback when geo / stored preference unavailable (outside China default). */
export const DEFAULT_LOCALE: Locale = "en";

/** localStorage key — also mirrored to a cookie on the client for SSR. */
export const LOCALE_STORAGE_KEY = "pawsure-locale";

/** @deprecated Legacy cookie name — still read once for migration. */
export const LOCALE_COOKIE = "locale";

export function isLocale(v: string | undefined | null): v is Locale {
  return v === "en" || v === "zh";
}
