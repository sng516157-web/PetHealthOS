"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  startFoundingBreederEarlyCheckout,
  startFoundingBreederLifetimeCheckout,
} from "@/app/actions";
import { BillingWalletNote } from "@/components/BillingWalletNote";
import { FoundingBreederSpotCounter } from "@/components/FoundingBreederSpotCounter";
import { Card } from "@/components/ui";
import { MotionPop } from "@/components/dashboard/DashboardMotion";
import {
  FOUNDING_BREEDER_EARLY_PRICE_USD,
  FOUNDING_BREEDER_LIFETIME_PRICE_USD,
} from "@/lib/founding-breeder-lifetime.constants";
import type { FoundingSpotAvailability } from "@/lib/founding-breeder-lifetime";
import { useI18n } from "@/lib/i18n/client";
import { trackBeginCheckout, trackFoundingLifetimeCtaClicked } from "@/lib/analytics";

export function FoundingBreederDashboardPromo({
  early: initialEarly,
  className,
}: {
  /** When omitted, loads availability client-side so the dashboard SSR stays fast. */
  early?: FoundingSpotAvailability;
  className?: string;
}) {
  const { t } = useI18n();
  const d = t.dashboard.foundingPromo;
  const router = useRouter();
  const [early, setEarly] = useState<FoundingSpotAvailability | null>(initialEarly ?? null);
  const showEarly = early ? !early.soldOut : false;
  const [earlyHidden, setEarlyHidden] = useState(early?.soldOut ?? false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tier, setTier] = useState<"early" | "lifetime">(showEarly ? "early" : "lifetime");

  useEffect(() => {
    if (initialEarly) return;
    let cancelled = false;
    fetch("/api/founding-breeder-lifetime/availability")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { early?: FoundingSpotAvailability } | null) => {
        if (cancelled || !data?.early) return;
        setEarly(data.early);
        setEarlyHidden(data.early.soldOut);
        if (!data.early.soldOut) setTier("early");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialEarly]);

  if (!early) return null;

  const f = tier === "early" ? t.pricing.foundingEarly : t.pricing.foundingLifetime;
  const priceUsd =
    tier === "early" ? FOUNDING_BREEDER_EARLY_PRICE_USD : FOUNDING_BREEDER_LIFETIME_PRICE_USD;

  function mapError(code: string): string {
    const map: Record<string, string> = {
      FOUNDING_SOLD_OUT: t.pricing.foundingEarly.soldOut,
      ALREADY_LIFETIME: f.alreadyActive,
      FOUNDING_FORFEITED: f.forfeited,
      ALREADY_SUBSCRIBED: f.forfeited,
      NOT_BREEDER: f.notBreeder,
      STRIPE_NOT_CONFIGURED: t.billing.providerComingSoon,
      PROVIDER_NOT_CONFIGURED: t.billing.providerComingSoon,
    };
    return map[code] ?? code;
  }

  function checkout(selected: "early" | "lifetime") {
    setError(null);
    setNotice(null);
    trackFoundingLifetimeCtaClicked(`app_dashboard_${selected}`);
    start(async () => {
      const fd = new FormData();
      fd.set("provider", "stripe");
      const res =
        selected === "early"
          ? await startFoundingBreederEarlyCheckout(fd)
          : await startFoundingBreederLifetimeCheckout(fd);
      if (res?.url) {
        trackBeginCheckout({
          accountType: "shop",
          product: selected === "early" ? "FOUNDING_BREEDER_EARLY" : "FOUNDING_BREEDER_LIFETIME",
          valueUsd: priceUsd,
        });
        setNotice(t.billing.redirecting);
        window.location.href = res.url;
        return;
      }
      if (res?.error) {
        if (res.error === "FOUNDING_SOLD_OUT" && selected === "early") {
          setEarlyHidden(true);
          setTier("lifetime");
        }
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
    <MotionPop index={2} className={className}>
      <Card className="overflow-hidden border-forest/20 bg-gradient-to-br from-sand/40 via-surface to-brand-50/40 p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 rounded-full border border-forest/20 bg-forest/5 px-2.5 py-0.5 text-[11px] font-semibold text-forest">
              <Sparkles size={11} /> {d.eyebrow}
            </span>
            <h2 className="mt-2 text-lg font-bold text-forest">{d.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">{d.subtitle}</p>
          </div>

          <div className={`grid gap-4 ${showEarly && !earlyHidden ? "md:grid-cols-2" : "max-w-md"}`}>
            {showEarly && !earlyHidden && (
              <button
                type="button"
                onClick={() => setTier("early")}
                className={`rounded-2xl border p-4 text-left transition ${
                  tier === "early"
                    ? "border-forest bg-brand-50/60 ring-2 ring-forest/20"
                    : "border-border bg-surface hover:border-brand-300"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-sage">
                  {t.pricing.foundingEarly.badge}
                </p>
                <p className="mt-1 text-lg font-bold text-forest">
                  {t.pricing.usd(FOUNDING_BREEDER_EARLY_PRICE_USD)}{" "}
                  <span className="text-sm font-normal text-muted">
                    {t.pricing.foundingEarly.priceCadence}
                  </span>
                </p>
                <FoundingBreederSpotCounter
                  initial={early}
                  className="mt-3 rounded-xl border border-brand-200/80 bg-white/80 p-3"
                  onSoldOut={() => {
                    setEarlyHidden(true);
                    setTier("lifetime");
                  }}
                />
              </button>
            )}
            <button
              type="button"
              onClick={() => setTier("lifetime")}
              className={`rounded-2xl border p-4 text-left transition ${
                tier === "lifetime"
                  ? "border-forest bg-brand-50/60 ring-2 ring-forest/20"
                  : "border-border bg-surface hover:border-brand-300"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {t.pricing.foundingLifetime.badge}
              </p>
              <p className="mt-1 text-lg font-bold text-forest">
                {t.pricing.usd(FOUNDING_BREEDER_LIFETIME_PRICE_USD)}{" "}
                <span className="text-sm font-normal text-muted">
                  {t.pricing.foundingLifetime.priceCadence}
                </span>
              </p>
              <p className="mt-3 text-xs text-muted">{t.pricing.foundingLifetime.subtitle}</p>
            </button>
          </div>

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          )}
          {notice && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => checkout(tier)}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:opacity-60"
            >
              {pending ? "…" : f.cta} {!pending && <ArrowRight size={15} />}
            </button>
            <BillingWalletNote />
          </div>
        </div>
      </Card>
    </MotionPop>
  );
}
