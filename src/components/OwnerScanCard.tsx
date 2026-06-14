"use client";

import { useState } from "react";
import { QrCode, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { PassportScanner } from "@/components/PassportScanner";

export function OwnerScanCard({ embedded = false }: { embedded?: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div
      className={
        embedded ? "bg-transparent" : "rounded-2xl border border-border bg-surface"
      }
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <QrCode size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            {t.me.scanTitle}
          </span>
          <span className="block truncate text-xs text-muted">{t.me.scanDesc}</span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-border p-4">
          <PassportScanner />
        </div>
      )}
    </div>
  );
}
