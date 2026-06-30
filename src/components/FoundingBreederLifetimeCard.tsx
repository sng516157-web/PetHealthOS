"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import {
  startFoundingBreederEarlyCheckout,
  startFoundingBreederLifetimeCheckout,
} from "@/app/actions";
import { BillingWalletNote } from "@/components/BillingWalletNote";
import { FoundingBreederSpotCounter } from "@/components/FoundingBreederSpotCounter";
import {
  FOUNDING_BREEDER_EARLY_PRICE_USD,
  FOUNDING_BREEDER_LIFETIME_PRICE_USD,
  type FoundingBreederTier,
} from "@/lib/founding-breeder-lifetime.constants";
import type { FoundingSpotAvailability } from "@/lib/founding-breeder-lifetime";
import { useI18n } from "@/lib/i18n/client";
import {
  trackBeginCheckout,
  trackFoundingLifetimeCtaClicked,
} from "@/lib/analytics";

type Props = {
  tier: FoundingBreederTier;
  mode: "marketing" | "checkout";
  earlyAvailability?: FoundingSpotAvailability;
  active?: boolean;
  blocked?: boolean;
  marketingHref?: string;
  onEarlySoldOut?: () => void;
};

export function FoundingBreederLifetimeCard({
  tier,
  mode,
  earlyAvailability,
  active = false,
  blocked = false,
  marketingHref = "/shop?founding=1#signup",
  onEarlySoldOut,
}: Props) {
  const { t } = useI18n();
  const f = tier === "early" ? t.pricing.foundingEarly : t.pricing.foundingLifetime;
  const priceUsd =
    tier === "early" ? FOUNDING_BREEDER_EARLY_PRICE_USD : FOUNDING_BREEDER_LIFETIME_PRICE_USD;
  const productKey =
    tier === "early" ? "FOUNDING_BREEDER_EARLY" : "FOUNDING_BREEDER_LIFETIME";
  const router = useRouter();
  const [hidden, setHidden] = useState(
    tier === "early" && earlyAvailability?.soldOut && !active && !blocked,
  );
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

  function handleEarlySoldOut() {
    if (tier !== "early") return;
    if (!active) {
      setHidden(true);
      onEarlySoldOut?.();
    }
  }

  function onMarketingClick() {
    trackFoundingLifetimeCtaClicked(
      mode === "checkout" ? `app_billing_${tier}` : `pricing_${tier}`,
    );
  }

  function checkout() {
    setError(null);
    setNotice(null);
    trackFoundingLifetimeCtaClicked(
      mode === "checkout" ? `app_billing_${tier}` : `pricing_${tier}`,
    );
    start(async () => {
      const fd = new FormData();
      fd.set("provider", "stripe");
      const res =
        tier === "early"
          ? await startFoundingBreederEarlyCheckout(fd)
          : await startFoundingBreederLifetimeCheckout(fd);
      if (res?.url) {
        trackBeginCheckout({
          accountType: "shop",
          product: productKey,
          valueUsd: priceUsd,
        });
        setNotice(t.billing.redirecting);
        window.location.href = res.url;
        return;
      }
      if (res?.error) {
        if (res.error === "FOUNDING_SOLD_OUT") handleEarlySoldOut();
        setError(mapError(res.error));
        return;
      }
      if (res?.ok) {
        if (res.demo) setNotice(t.billing.demoActivated);
        router.refresh();
      }
    });
  }

  const href =
    tier === "early" ? `${marketingHref}${marketingHref.includes("?") ? "&" : "?"}tier=early` : marketingHref;

  return (
    <div
      id={tier === "early" ? "founding-breeder-early" : "founding-breeder-lifetime"}
      className={`relative flex h-full flex-col rounded-2xl border p-6 shadow-soft ${
        blocked
          ? "border-border bg-paper/80 opacity-90"
          : tier === "early"
            ? "border-forest/30 bg-gradient-to-br from-brand-50/50 via-surface to-sand/40 ring-1 ring-forest/10"
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
          {t.pricing.usd(priceUsd)}
          <span className="text-sm font-normal text-muted"> {f.priceCadence}</span>
        </div>
        {tier === "early" && earlyAvailability && !active && !blocked && (
          <FoundingBreederSpotCounter
            initial={earlyAvailability}
            className="mt-3 rounded-xl border border-brand-200/80 bg-white/60 p-3"
            onSoldOut={handleEarlySoldOut}
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
            href={href}
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
