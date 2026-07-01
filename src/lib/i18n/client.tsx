"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, Locale, isLocale } from "./config";
import { en, type Dictionary } from "./en";
import { zh } from "./zh";
import { persistLocale, readStoredLocale } from "./storage";

const DICTS: Record<Locale, Dictionary> = { en, zh };

type I18nValue = {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nValue>({
  locale: DEFAULT_LOCALE,
  t: DICTS[DEFAULT_LOCALE],
  setLocale: () => {},
});

export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      if (next === locale) return;
      persistLocale(next);
      document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
      router.refresh();
    },
    [locale, router],
  );

  // Server is source of truth after refresh — avoids client/server text mismatch.
  useLayoutEffect(() => {
    setLocaleState(initialLocale);
    document.documentElement.lang = initialLocale === "zh" ? "zh-CN" : "en";
  }, [initialLocale]);

  useLayoutEffect(() => {
    if (document.documentElement.dataset.seoBot === "true") return;
    const stored = readStoredLocale();
    if (stored && stored !== initialLocale) {
      persistLocale(stored);
      router.refresh();
      return;
    }
    if (!stored) persistLocale(initialLocale);
  }, [initialLocale, router]);

  const value = useMemo(
    () => ({ locale, t: DICTS[locale], setLocale }),
    [locale, setLocale],
  );

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

/** First visit: persist server locale (English default). Geo auto-switch disabled — HK proxy made every visitor look CN/HK. */
export function LocaleBootstrap({ serverLocale }: { serverLocale: Locale }) {
  useLayoutEffect(() => {
    if (document.documentElement.dataset.seoBot === "true") return;
    if (readStoredLocale()) return;
    persistLocale(serverLocale);
  }, [serverLocale]);

  return null;
}
