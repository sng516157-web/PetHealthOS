"use client";

import { createContext, useContext } from "react";
import { Locale } from "./config";
import { en, type Dictionary } from "./en";
import { zh } from "./zh";

const DICTS: Record<Locale, Dictionary> = { en, zh };

type I18nValue = { locale: Locale; t: Dictionary };

const I18nContext = createContext<I18nValue>({ locale: "en", t: en });

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, t: DICTS[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}
