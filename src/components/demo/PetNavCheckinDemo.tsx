"use client";

import { useState } from "react";
import { Check, Hospital, QrCode } from "lucide-react";
import { Card } from "@/components/ui";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import { DEMO_ACTIVE_STAYS } from "@/components/demo/pet-nav-demo-data";
import { useI18n } from "@/lib/i18n/client";

export function PetNavCheckinDemo() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [stays, setStays] = useState(DEMO_ACTIVE_STAYS);
  const [notice, setNotice] = useState<string | null>(null);

  function takeBack() {
    setStays([]);
    setNotice(t.me.takenBack);
    setOpen(false);
  }

  return (
    <PetNavDemoChrome>
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Hospital size={18} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-forest">{t.me.checkinTitle}</h2>
        </div>
        <p className="mt-2 text-sm text-muted">{t.me.checkinDesc}</p>
        <p className="mt-1 text-xs text-muted">{t.tabs.checkinDesc}</p>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <QrCode size={16} /> {open ? t.me.hideQr : t.me.showQr}
        </button>

        {open && (
          <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-6">
            <div className="grid h-48 w-48 place-items-center rounded-xl border-2 border-dashed border-brand-200 bg-white">
              <div className="grid grid-cols-5 gap-1 p-2">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-sm ${i % 3 === 0 ? "bg-forest" : "bg-slate-200"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-xs text-muted">{t.me.qrHint}</p>
          </div>
        )}

        {stays.length > 0 && (
          <div className="mt-5 rounded-xl border border-brand-200 bg-brand-50/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-800">
              {t.me.currentlyAt}
            </p>
            <ul className="mt-2 space-y-1">
              {stays.map((s) => (
                <li key={s.id} className="text-sm font-medium text-forest">
                  {s.orgName}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={takeBack}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-brand-300 bg-white px-3 py-2 text-xs font-semibold text-brand-800 hover:bg-brand-50"
            >
              <Check size={14} /> {t.me.takeBack}
            </button>
          </div>
        )}

        {notice && (
          <p className="mt-3 text-sm font-medium text-emerald-700">{notice}</p>
        )}
      </Card>
    </PetNavDemoChrome>
  );
}
