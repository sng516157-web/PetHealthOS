"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BulletList } from "@/components/landing/LandingBlocks";
import { FoundingBreederLifetimeCard } from "@/components/FoundingBreederLifetimeCard";
import { MotionReveal } from "@/components/motion/aurora";
import type { FoundingSpotAvailability } from "@/lib/founding-breeder-lifetime";

export function FoundingBreederHomepageOffers({
  h,
  early,
  shopSignupHref,
}: {
  h: {
    foundingEyebrow: string;
    foundingBullets: string[];
    foundingSecondaryCta: string;
    foundingOffersTitle: string;
    foundingOffersSubtitle: string;
  };
  early: FoundingSpotAvailability;
  shopSignupHref: string;
}) {
  const showEarly = !early.soldOut;

  return (
    <section className="border-b border-border bg-surface/60">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <MotionReveal>
          <div className="mb-6 max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
              {h.foundingEyebrow}
            </span>
            <h2 className="mt-2 text-2xl font-extrabold text-forest md:text-3xl">
              {h.foundingOffersTitle}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{h.foundingOffersSubtitle}</p>
            <div className="mt-4 max-w-xl">
              <BulletList items={h.foundingBullets} />
            </div>
          </div>

          <div
            className={`grid gap-4 ${showEarly ? "lg:grid-cols-2" : "max-w-lg"}`}
          >
            {showEarly && (
              <FoundingBreederLifetimeCard
                tier="early"
                mode="marketing"
                earlyAvailability={early}
                marketingHref="/shop?founding=1#signup"
              />
            )}
            <FoundingBreederLifetimeCard
              tier="lifetime"
              mode="marketing"
              marketingHref="/shop?founding=1#signup"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={shopSignupHref}
              className="inline-flex items-center gap-2 rounded-2xl border border-brand-300 bg-surface px-6 py-3 text-sm font-semibold text-forest transition hover:border-brand-400"
            >
              {h.foundingSecondaryCta}
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl px-2 py-3 text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Compare all plans <ArrowRight size={16} />
            </Link>
          </div>
        </MotionReveal>
      </div>
    </section>
  );
}
