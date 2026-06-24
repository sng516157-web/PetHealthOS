"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/en";
import { BulletList } from "@/components/landing/LandingBlocks";
import { FoundingLifetimeCtaLink } from "@/components/FoundingLifetimeCtaLink";
import { FoundingBreederSpotCounter } from "@/components/FoundingBreederSpotCounter";
import { MotionReveal } from "@/components/motion/aurora";
import { FOUNDING_BREEDER_LIFETIME_PRICE_USD } from "@/lib/founding-breeder-lifetime.constants";

type Availability = {
  limit: number;
  claimed: number;
  remaining: number;
  soldOut: boolean;
};

export function FoundingBreederHomepageSection({
  t,
  h,
  initial,
  shopSignupHref,
}: {
  t: Dictionary;
  h: Dictionary["landing"]["homepageV2"];
  initial: Availability;
  shopSignupHref: string;
}) {
  const [hidden, setHidden] = useState(initial.soldOut);

  if (hidden) return null;

  return (
    <section className="border-b border-border bg-surface/60">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <MotionReveal>
          <div className="overflow-hidden rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-50/90 via-surface to-sand/30 p-8 shadow-soft md:p-10">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
              {h.foundingEyebrow}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-forest md:text-3xl">
              {h.foundingTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink/70">{h.foundingCopy}</p>
            <div className="mt-6 max-w-xl">
              <BulletList items={h.foundingBullets} />
            </div>
            <FoundingBreederSpotCounter
              initial={initial}
              className="mt-6 max-w-md rounded-2xl border border-brand-200/80 bg-white/70 p-4"
              onSoldOut={() => setHidden(true)}
            />
            <p className="mt-4 text-sm font-semibold text-forest">
              {t.pricing.usd(FOUNDING_BREEDER_LIFETIME_PRICE_USD)}{" "}
              {t.pricing.foundingLifetime.priceCadence}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <FoundingLifetimeCtaLink
                href="/shop?founding=1#signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-forest px-6 py-3 text-sm font-semibold text-white shadow-ps-button transition hover:bg-forest/90"
              >
                {h.foundingCta} <ArrowRight size={16} />
              </FoundingLifetimeCtaLink>
              <Link
                href={shopSignupHref}
                className="inline-flex items-center gap-2 rounded-2xl border border-brand-300 bg-surface px-6 py-3 text-sm font-semibold text-forest transition hover:border-brand-400"
              >
                {h.foundingSecondaryCta}
              </Link>
            </div>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
