"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Plus } from "lucide-react";
import { addFacilitySlot } from "@/app/actions";
import { BillingWalletNote } from "@/components/BillingWalletNote";
import { useI18n } from "@/lib/i18n/client";

export function FacilitySlots({
  base,
  price,
  inCare,
  limit,
}: {
  base: number;
  price: number;
  inCare: number;
  limit: number;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function mapError(code: string): string {
    if (
      code === "PROVIDER_NOT_CONFIGURED" ||
      code === "PROVIDER_NOT_IMPLEMENTED" ||
      code === "STRIPE_NOT_CONFIGURED"
    ) {
      return t.billing.providerComingSoon;
    }
    return code;
  }

  function buy() {
    setError(null);
    setNotice(null);
    setBusy("stripe");
    start(async () => {
      const fd = new FormData();
      fd.set("provider", "stripe");
      const res = await addFacilitySlot(fd);
      setBusy(null);
      if (res?.url) {
        setNotice(t.billing.redirecting);
        window.location.href = res.url;
        return;
      }
      if (res?.error) {
        setError(mapError(res.error));
        return;
      }
      if (res?.ok) {
        if (res.demo) setNotice(t.facility.slotAdded);
        router.refresh();
      }
    });
  }

  const pct = Math.min(100, Math.round((inCare / Math.max(1, limit)) * 100));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2">
        <PawPrint size={16} className="text-brand-600" />
        <h3 className="text-sm font-semibold text-foreground">{t.facility.slotsTitle}</h3>
      </div>
      <p className="mt-1 text-xs text-muted">{t.facility.slotsDesc(base, price)}</p>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-sm text-foreground">{t.facility.slotsStatus(inCare, limit)}</p>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
      )}

      <div className="mt-4">
        <button
          onClick={() => buy()}
          disabled={pending}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          <Plus size={13} />
          {busy === "stripe" ? "…" : t.facility.addSlot(price)}
        </button>
        <BillingWalletNote />
      </div>
    </div>
  );
}
