"use client";

import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/config";

const LABELS: Record<Locale, string> = { en: "EN", zh: "中文" };

export function LocaleToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();

  function choose(next: Locale) {
    if (next === locale) return;
    setLocale(next);
  }

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-border bg-background p-0.5 ${
        compact ? "" : "w-full justify-center"
      }`}
    >
      {!compact && (
        <Languages size={13} className="ml-1.5 mr-0.5 text-slate-400" />
      )}
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => choose(l)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition ${
            locale === l
              ? "bg-brand-50 text-brand-700"
              : "text-slate-500 hover:text-foreground"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
