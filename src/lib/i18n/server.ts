import "server-only";
import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_STORAGE_KEY,
  Locale,
  isLocale,
} from "./config";
import { localeFromHeaders } from "./geo";
import { en, type Dictionary } from "./en";
import { zh } from "./zh";

const DICTS: Record<Locale, Dictionary> = { en, zh };

/** Resolve locale: client-synced preference (from localStorage mirror) → geo → default. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const mirrored = store.get(LOCALE_STORAGE_KEY)?.value;
  if (isLocale(mirrored)) return mirrored;
  const legacy = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(legacy)) return legacy;

  const h = await headers();
  return localeFromHeaders(h);
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTS[locale];
}

export async function getI18n(): Promise<{ locale: Locale; t: Dictionary }> {
  const locale = await getLocale();
  return { locale, t: DICTS[locale] };
}
