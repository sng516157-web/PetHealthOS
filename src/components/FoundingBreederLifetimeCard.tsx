"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { startFoundingBreederLifetimeCheckout } from "@/app/actions";
import { BillingWalletNote } from "@/components/BillingWalletNote";
import { FOUNDING_BREEDER_LIFETIME_PRICE_USD } from "@/lib/founding-breeder-lifetime.constants";
import { useI18n } from "@/lib/i18n/client";
import {
  trackBeginCheckout,
  trackFoundingLifetimeCtaClicked,
} from "@/lib/analytics";

type Props = {
  mode: "marketing" | "checkout";
  soldOut?: boolean;
  remaining?: number;
  active?: boolean;
  marketingHref?: string;
};

export function FoundingBreederLifetimeCard({
  mode,
  soldOut = false,
  remaining,
  active = false,
  marketingHref = "/shop",
}: Props) {
  const { t } = useI18n();
  const f = t.pricing.foundingLifetime;
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function mapError(code: string): string {
    const map: Record<string, string> = {
      FOUNDING_SOLD_OUT: f.soldOut,
      ALREADY_LIFETIME: f.alreadyActive,
      ALREADY_SUBSCRIBED: f.alreadySubscribed,
      NOT_BREEDER: f.notBreeder,
      STRIPE_NOT_CONFIGURED: t.billing.providerComingSoon,
      PROVIDER_NOT_CONFIGURED: t.billing.providerComingSoon,
    };
    return map[code] ?? code;
  }

  function onMarketingClick() {
    trackFoundingLifetimeCtaClicked(mode === "checkout" ? "app_billing" : "pricing");
  }

  function checkout() {
    setError(null);
    setNotice(null);
    trackFoundingLifetimeCtaClicked("app_billing");
    start(async () => {
      const fd = new FormData();
      fd.set("provider", "stripe");
      const res = await startFoundingBreederLifetimeCheckout(fd);
      if (res?.url) {
        trackBeginCheckout({
          accountType: "shop",
          product: "FOUNDING_BREEDER_LIFETIME",
          valueUsd: FOUNDING_BREEDER_LIFETIME_PRICE_USD,
        });
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

  const disabled = soldOut || active;

  return (
    <div
      id="founding-breeder-lifetime"
      className="relative flex h-full flex-col rounded-2xl border border-forest/25 bg-gradient-to-br from-sand/40 via-surface to-brand-50/30 p-6 shadow-soft"
    >
      <span className="inline-flex w-fit items-center gap-1 rounded-full border border-forest/20 bg-forest/5 px-2.5 py-0.5 text-[11px] font-semibold text-forest">
        <Sparkles size={11} /> {f.badge}
      </span>

      <h3 className="mt-3 text-base font-semibold text-foreground">{f.title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-muted">{f.subtitle}</p>

      <div className="mt-4">
        <div className="text-3xl font-bold text-foreground">
          {t.pricing.usd(FOUNDING_BREEDER_LIFETIME_PRICE_USD)}
          <span className="text-sm font-normal text-muted"> {f.priceCadence}</span>
        </div>
        {remaining != null && remaining > 0 && !active && (
          <p className="mt-1 text-xs font-medium text-brand-700">
            {f.spotsRemaining(remaining)}
          </p>
        )}
      </div>

      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-600">
        {f.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
            {feature}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">{f.smallPrint}</p>

      {error && (
        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      {notice && (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <div className="mt-5">
        {active ? (
          <span className="inline-flex w-full items-center justify-center rounded-xl bg-forest/10 px-4 py-2.5 text-sm font-semibold text-forest">
            {f.activeBadge}
          </span>
        ) : soldOut ? (
          <span className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-paper px-4 py-2.5 text-sm font-medium text-muted">
            {f.soldOut}
          </span>
        ) : mode === "marketing" ? (
          <Link
            href={marketingHref}
            onClick={onMarketingClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest/90"
          >
            {f.cta} <ArrowRight size={15} />
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={() => checkout()}
              disabled={pending || disabled}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:opacity-60"
            >
              {pending ? "…" : f.cta} {!pending && <ArrowRight size={15} />}
            </button>
            <BillingWalletNote />
          </>
        )}
      </div>
    </div>
  );
}
