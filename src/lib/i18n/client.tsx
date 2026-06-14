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
      setLocaleState(next);
      document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
      router.refresh();
    },
    [locale, router],
  );

  useLayoutEffect(() => {
    if (document.documentElement.dataset.seoBot === "true") return;
    const stored = readStoredLocale();
    if (stored) {
      if (stored !== locale) {
        setLocaleState(stored);
        document.documentElement.lang = stored === "zh" ? "zh-CN" : "en";
        if (stored !== initialLocale) router.refresh();
      }
      return;
    }
    persistLocale(initialLocale);
  }, [initialLocale, locale, router]);

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

/** First visit: if no localStorage preference, seed from /api/geo (CN/HK/MO → zh). */
export function LocaleBootstrap({ serverLocale }: { serverLocale: Locale }) {
  const router = useRouter();

  useLayoutEffect(() => {
    if (document.documentElement.dataset.seoBot === "true") return;
    if (readStoredLocale()) return;
    void fetch("/api/geo")
      .then((r) => r.json())
      .then((data: { locale?: string }) => {
        if (!isLocale(data.locale) || data.locale === serverLocale) return;
        persistLocale(data.locale);
        document.documentElement.lang = data.locale === "zh" ? "zh-CN" : "en";
        router.refresh();
      })
      .catch(() => {
        persistLocale(serverLocale);
      });
  }, [serverLocale, router]);

  return null;
}
