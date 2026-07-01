"use client";

import { useState } from "react";
import { QrCode, ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { PassportScanner } from "@/components/PassportScanner";

export function OwnerScanCard({
  embedded = false,
  preview = false,
  defaultOpen = false,
  collapsible = true,
  id,
}: {
  embedded?: boolean;
  preview?: boolean;
  /** Start with scanner visible (owner home). */
  defaultOpen?: boolean;
  /** When false, scanner is always shown (no accordion). */
  collapsible?: boolean;
  id?: string;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(defaultOpen || !collapsible);
  const showScanner = !collapsible || open;

  const scannerBlock = (
    <div className={collapsible ? "min-w-0 border-t border-border p-4" : "min-w-0 p-4 pt-0"}>
      {preview ? (
        <p className="text-xs text-muted">{t.landing.scan.previewHint}</p>
      ) : (
        <PassportScanner />
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <div
        id={id}
        className={
          embedded
            ? "min-w-0 max-w-full bg-transparent"
            : "min-w-0 max-w-full rounded-2xl border border-border bg-surface"
        }
      >
        <div className="flex w-full min-w-0 max-w-full items-center gap-3 p-4">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <QrCode size={16} />
          </span>
          <span className="min-w-0 flex-1 overflow-hidden">
            <span className="block text-sm font-semibold text-foreground">{t.me.scanTitle}</span>
            <span className="block break-words text-xs leading-snug text-muted">{t.me.scanDesc}</span>
          </span>
        </div>
        {scannerBlock}
      </div>
    );
  }

  return (
    <div
      id={id}
      className={
        embedded
          ? "min-w-0 max-w-full bg-transparent"
          : "min-w-0 max-w-full rounded-2xl border border-border bg-surface"
      }
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-w-0 max-w-full items-center gap-3 p-4 text-left"
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <QrCode size={16} />
        </span>
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block text-sm font-semibold text-foreground">{t.me.scanTitle}</span>
          <span className="block break-words text-xs leading-snug text-muted">{t.me.scanDesc}</span>
        </span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {showScanner && scannerBlock}
    </div>
  );
}
