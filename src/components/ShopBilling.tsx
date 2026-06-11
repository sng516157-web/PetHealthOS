"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard, Crown } from "lucide-react";
import { startPlanCheckout } from "@/app/actions";
import { BillingWalletNote } from "@/components/BillingWalletNote";
import { useI18n } from "@/lib/i18n/client";

type Interval = "month" | "year";

export function ShopBilling({
  currentPlan,
  currentInterval,
  priceMonth,
  priceYear,
  title,
  subtitle,
}: {
  currentPlan: string;
  currentInterval: string | null;
  priceMonth: number;
  priceYear: number;
  title?: string;
  subtitle?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [interval, setInterval] = useState<Interval>("year");
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isShop = currentPlan === "SHOP";

  const intervalLabel = (i: string): string =>
    i === "month" ? t.shopBilling.monthly : i === "year" ? t.shopBilling.yearly : i;

  const options: { id: Interval; label: string; price: string; sub?: string }[] = [
    { id: "month", label: t.shopBilling.monthly, price: t.pricing.rmb(priceMonth), sub: t.pricing.perMonth.trim() },
    {
      id: "year",
      label: t.shopBilling.yearly,
      price: t.pricing.rmb(priceYear),
      sub: t.shopBilling.perYear,
    },
  ];

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
      fd.set("scope", "org");
      fd.set("plan", "SHOP");
      fd.set("interval", interval);
      fd.set("provider", "stripe");
      const res = await startPlanCheckout(fd);
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
        if (res.demo) setNotice(t.billing.demoActivated);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <Crown size={16} className="text-brand-600" />
          <h3 className="text-sm font-semibold text-foreground">{title ?? t.shopBilling.title}</h3>
          {isShop && (
            <span className="ml-auto rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">
              {currentInterval
                ? t.shopBilling.activeInterval(intervalLabel(currentInterval))
                : t.billing.currentPlan}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs text-muted">{subtitle ?? t.shopBilling.subtitle}</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {options.map((o) => {
            const active = interval === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setInterval(o.id)}
                className={`rounded-2xl border p-3 text-left transition ${
                  active
                    ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-100"
                    : "border-border bg-paper hover:border-brand-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-forest">{o.label}</span>
                  {active && <Check size={14} className="text-brand-600" />}
                </div>
                <div className="mt-1 text-lg font-bold text-foreground">{o.price}</div>
                {o.sub && <div className="text-[11px] text-muted">{o.sub}</div>}
              </button>
            );
          })}
        </div>

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
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            <CreditCard size={14} /> {busy === "stripe" ? "…" : t.billing.payStripe}
          </button>
          <BillingWalletNote />
        </div>
      </div>
    </div>
  );
}
