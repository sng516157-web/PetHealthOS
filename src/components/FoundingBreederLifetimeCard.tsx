"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { startFoundingBreederLifetimeCheckout } from "@/app/actions";
import { BillingWalletNote } from "@/components/BillingWalletNote";
import { FoundingBreederSpotCounter } from "@/components/FoundingBreederSpotCounter";
import { FOUNDING_BREEDER_LIFETIME_PRICE_USD } from "@/lib/founding-breeder-lifetime.constants";
import { useI18n } from "@/lib/i18n/client";
import {
  trackBeginCheckout,
  trackFoundingLifetimeCtaClicked,
} from "@/lib/analytics";

type Availability = {
  limit: number;
  claimed: number;
  remaining: number;
  soldOut: boolean;
};

type Props = {
  mode: "marketing" | "checkout";
  availability: Availability;
  active?: boolean;
  blocked?: boolean;
  marketingHref?: string;
  onSoldOut?: () => void;
};

export function FoundingBreederLifetimeCard({
  mode,
  availability: initialAvailability,
  active = false,
  blocked = false,
  marketingHref = "/shop?founding=1#signup",
  onSoldOut,
}: Props) {
  const { t } = useI18n();
  const f = t.pricing.foundingLifetime;
  const router = useRouter();
  const [hidden, setHidden] = useState(initialAvailability.soldOut && !active && !blocked);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (hidden) return null;

  function mapError(code: string): string {
    const map: Record<string, string> = {
      FOUNDING_SOLD_OUT: f.soldOut,
      ALREADY_LIFETIME: f.alreadyActive,
      FOUNDING_FORFEITED: f.forfeited,
      ALREADY_SUBSCRIBED: f.forfeited,
      NOT_BREEDER: f.notBreeder,
      STRIPE_NOT_CONFIGURED: t.billing.providerComingSoon,
      PROVIDER_NOT_CONFIGURED: t.billing.providerComingSoon,
    };
    return map[code] ?? code;
  }

  function handleSoldOut() {
    if (!active) {
      setHidden(true);
      onSoldOut?.();
    }
  }

  function onMarketingClick() {
    trackFoundingLifetimeCtaClicked(mode === "checkout" ? "app_billing" : "pricing");
  }

  function checkout() {
    setError(null);
    setNotice(null);
    trackFoundingLifetimeCtaClicked(mode === "checkout" ? "app_billing" : "pricing");
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
        if (res.error === "FOUNDING_SOLD_OUT") handleSoldOut();
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
    <div
      id="founding-breeder-lifetime"
      className={`relative flex h-full flex-col rounded-2xl border p-6 shadow-soft ${
        blocked
          ? "border-border bg-paper/80 opacity-90"
          : "border-forest/25 bg-gradient-to-br from-sand/40 via-surface to-brand-50/30"
      }`}
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
        {!active && !blocked && (
          <FoundingBreederSpotCounter
            initial={initialAvailability}
            className="mt-3 rounded-xl border border-brand-200/80 bg-white/60 p-3"
            onSoldOut={handleSoldOut}
          />
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

      {blocked && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
          {f.forfeitedDetail}
        </p>
      )}

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
        ) : blocked ? (
          <span className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-slate-100 px-4 py-2.5 text-sm font-medium text-muted">
            {f.forfeited}
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
              disabled={pending}
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
