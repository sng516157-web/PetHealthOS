"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { LOCALES, type Locale } from "@/lib/i18n/config";
import { setLocale } from "@/app/actions";

const LABELS: Record<Locale, string> = { en: "EN", zh: "中文" };

export function LocaleToggle({ compact = false }: { compact?: boolean }) {
  const { locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Locale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
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
          onClick={() => choose(l)}
          disabled={pending}
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
