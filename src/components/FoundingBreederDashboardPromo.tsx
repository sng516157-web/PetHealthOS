"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { startFoundingBreederLifetimeCheckout } from "@/app/actions";
import { BillingWalletNote } from "@/components/BillingWalletNote";
import { FoundingBreederSpotCounter } from "@/components/FoundingBreederSpotCounter";
import { Card } from "@/components/ui";
import { MotionReveal } from "@/components/dashboard/DashboardMotion";
import { FOUNDING_BREEDER_LIFETIME_PRICE_USD } from "@/lib/founding-breeder-lifetime.constants";
import { useI18n } from "@/lib/i18n/client";
import { trackBeginCheckout, trackFoundingLifetimeCtaClicked } from "@/lib/analytics";

type Availability = {
  limit: number;
  claimed: number;
  remaining: number;
  soldOut: boolean;
};

export function FoundingBreederDashboardPromo({
  initial,
  className,
}: {
  initial: Availability;
  className?: string;
}) {
  const { t } = useI18n();
  const f = t.pricing.foundingLifetime;
  const d = t.dashboard.foundingPromo;
  const router = useRouter();
  const [hidden, setHidden] = useState(initial.soldOut);
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

  function checkout() {
    setError(null);
    setNotice(null);
    trackFoundingLifetimeCtaClicked("app_dashboard");
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
        if (res.error === "FOUNDING_SOLD_OUT") setHidden(true);
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
    <MotionReveal delay={100} className={className}>
      <Card className="overflow-hidden border-forest/20 bg-gradient-to-br from-sand/40 via-surface to-brand-50/40 p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <span className="inline-flex items-center gap-1 rounded-full border border-forest/20 bg-forest/5 px-2.5 py-0.5 text-[11px] font-semibold text-forest">
              <Sparkles size={11} /> {f.badge}
            </span>
            <h2 className="mt-2 text-lg font-bold text-forest">{f.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">{d.subtitle}</p>
            <p className="mt-3 text-sm font-semibold text-forest">
              {t.pricing.usd(FOUNDING_BREEDER_LIFETIME_PRICE_USD)}{" "}
              <span className="font-normal text-muted">{f.priceCadence}</span>
            </p>
          </div>
          <FoundingBreederSpotCounter
            initial={initial}
            className="w-full shrink-0 rounded-xl border border-brand-200/80 bg-white/80 p-4 lg:max-w-xs"
            onSoldOut={() => setHidden(true)}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
        {notice && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {notice}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => checkout()}
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-forest/90 disabled:opacity-60"
          >
            {pending ? "…" : f.cta} {!pending && <ArrowRight size={15} />}
          </button>
          <BillingWalletNote />
        </div>
      </Card>
    </MotionReveal>
  );
}
