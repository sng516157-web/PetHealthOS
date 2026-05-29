import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, Locale, isLocale } from "./config";
import { en, type Dictionary } from "./en";
import { zh } from "./zh";

const DICTS: Record<Locale, Dictionary> = { en, zh };

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTS[locale];
}

// Convenience for server components: resolve locale + dictionary in one call.
export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: DICTS[locale] };
}
