import { LOCALE_STORAGE_KEY, isLocale, type Locale } from "./config";

/** Read the user's saved locale (browser only). */
export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(v) ? v : null;
  } catch {
    return null;
  }
}

/**
 * Persist locale in localStorage (source of truth) and mirror to a short-lived
 * cookie so the next server render matches the user's choice.
 */
export function persistLocale(locale: Locale): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_STORAGE_KEY}=${locale};path=/;max-age=31536000;SameSite=Lax`;
  } catch {
    /* private mode / blocked storage */
  }
}
