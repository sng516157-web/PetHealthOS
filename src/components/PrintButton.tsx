"use client";

import { Printer } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export function PrintButton() {
  const { t } = useI18n();
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
    >
      <Printer size={13} /> {t.passport.print}
    </button>
  );
}
