"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, CreditCard } from "lucide-react";
import { startPlanCheckout } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export type PlanOption = {
  key: string;
  priceRmb: number;
  includedPets: number;
  extraPetPriceRmb: number;
  issuePassports: boolean;
  multiSeat: boolean;
};

export function UpgradePanel({
  scope,
  plans,
  currentPlan,
}: {
  scope: "org" | "user";
  plans: PlanOption[];
  currentPlan: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function planName(key: string): string {
    return (t.plans as Record<string, string>)[key] ?? key;
  }

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

  function choose(planKey: string, provider: string) {
    setError(null);
    setNotice(null);
    setBusyKey(`${planKey}:${provider}`);
    start(async () => {
      const fd = new FormData();
      fd.set("scope", scope);
      fd.set("plan", planKey);
      fd.set("provider", provider);
      const res = await startPlanCheckout(fd);
      setBusyKey(null);
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
    <div className="space-y-3">
      {error && (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((p) => {
          const isCurrent = p.key === currentPlan;
          const paid = p.priceRmb > 0;
          return (
            <div
              key={p.key}
              className={`rounded-2xl border p-5 ${
                isCurrent ? "border-brand-400 bg-brand-50/40" : "border-border bg-surface"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {planName(p.key)}
                </h3>
                {isCurrent && (
                  <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                    {t.billing.currentPlan}
                  </span>
                )}
              </div>
              <div className="mt-2 text-2xl font-bold text-foreground">
                {paid ? t.pricing.rmb(p.priceRmb) : t.pricing.free}
                {paid && (
                  <span className="text-sm font-normal text-muted">
                    {t.pricing.perMonth}
                  </span>
                )}
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-emerald-500" />
                  {t.pricing.includedPets(p.includedPets)}
                </li>
                {p.extraPetPriceRmb > 0 && (
                  <li className="flex items-center gap-1.5">
                    <Check size={13} className="text-emerald-500" />
                    {t.pricing.extraPet(p.extraPetPriceRmb)}
                  </li>
                )}
                {p.issuePassports && (
                  <li className="flex items-center gap-1.5">
                    <Check size={13} className="text-emerald-500" />
                    {t.pricing.issuePassports}
                  </li>
                )}
                {p.multiSeat && (
                  <li className="flex items-center gap-1.5">
                    <Check size={13} className="text-emerald-500" />
                    {t.pricing.multiSeat}
                  </li>
                )}
              </ul>

              {!isCurrent && (
                <div className="mt-4 space-y-2">
                  {paid ? (
                    <>
                      <button
                        onClick={() => choose(p.key, "stripe")}
                        disabled={pending}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
                      >
                        <CreditCard size={13} />{" "}
                        {busyKey === `${p.key}:stripe` ? "…" : t.billing.payStripe}
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => choose(p.key, "wechat")}
                          disabled={pending}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-60"
                        >
                          {t.billing.payWechat}
                        </button>
                        <button
                          onClick={() => choose(p.key, "alipay")}
                          disabled={pending}
                          className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-sky-300 hover:text-sky-700 disabled:opacity-60"
                        >
                          {t.billing.payAlipay}
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => choose(p.key, "stripe")}
                      disabled={pending}
                      className="inline-flex w-full items-center justify-center rounded-lg border border-border px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
                    >
                      {t.pricing.choose}
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
