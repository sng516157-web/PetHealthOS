import type { Metadata } from "next";
import Link from "next/link";
import { Check, Star } from "lucide-react";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import {
  ORG_PLANS,
  USER_PLANS,
  SHOP_BILLING,
  OWNER_BILLING,
  FACILITY_BASE_CAPACITY,
  FACILITY_EXTRA_SLOT_PRICE_USD,
} from "@/lib/plans";
import { LocaleToggle } from "@/components/LocaleToggle";
import { FeedbackNavLink } from "@/components/FeedbackNavLink";
import { getI18n } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/en";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";
import { pageMetadata } from "@/lib/seo";
import { formatUsd } from "@/lib/money";
import { FoundingBreederLifetimeCard } from "@/components/FoundingBreederLifetimeCard";
import { BreederPricingFaq } from "@/components/BreederPricingFaq";
import { getFoundingBreederOffersAvailability } from "@/lib/founding-breeder-lifetime";

export const metadata: Metadata = pageMetadata({
  title: "Plans & Pricing (USD)",
  description: `Pet owners: 1 pet free, Owner Plus ${formatUsd(OWNER_BILLING.month)}/mo or ${formatUsd(OWNER_BILLING.year)}/yr for 5 pets. Breeders & shops: from ${formatUsd(SHOP_BILLING.month)}/mo.`,
  path: "/pricing",
});

export default async function PricingPage() {
  const { locale, t } = await getI18n();
  const shop = ORG_PLANS.SHOP;
  const offers = await getFoundingBreederOffersAvailability();
  const facilityFeatures = t.facility.planBenefits(
    FACILITY_BASE_CAPACITY,
    FACILITY_EXTRA_SLOT_PRICE_USD,
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <AuroraOrbs subtle className="-z-10 opacity-70" />
      <header className="relative border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <PawSureMarkTile className="h-9 w-9" />
            <span className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-forest">PawSure</span>
              {locale === "zh" && (
                <span className="font-cn text-xs font-bold text-forest/70">宠诺</span>
              )}
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/pricing"
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-forest sm:inline-flex"
            >
              {t.landing.nav.pricing}
            </Link>
            <FeedbackNavLink label={t.landing.nav.feedback} />
            <LocaleToggle compact />
            <Link
              href="/login"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
            >
              {t.auth.signIn}
            </Link>
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-5 py-12 md:px-8">
        <MotionPop index={0}>
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t.pricing.title}
            </h1>
            <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
              {t.pricing.subtitle}
            </p>
          </div>
        </MotionPop>

        <MotionReveal delay={80}>
          <section className="mt-10">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              {t.pricing.forOwners}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div
                className={`rounded-2xl border border-border bg-surface p-6 ${motionCardHover}`}
              >
                <h3 className="text-base font-semibold text-foreground">
                  {(t.plans as Record<string, string>).FREE}
                </h3>
                <p className="mt-0.5 text-xs text-muted">{t.pricing.freeTagline}</p>
                <div className="mt-3 text-3xl font-bold text-foreground">{t.pricing.free}</div>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    {t.pricing.includedPets(USER_PLANS.FREE.includedPets)}
                  </li>
                  <li className="flex items-start gap-2">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    {t.pricing.aiAssistant}
                  </li>
                </ul>
                <Link
                  href="/owner"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-brand-300"
                >
                  {t.pricing.getStarted}
                </Link>
              </div>
              <OrgBillingCard
                t={t}
                name={t.shopBilling.monthly}
                price={t.pricing.usd(OWNER_BILLING.month)}
                cadence={t.pricing.perMonth.trim()}
                note={t.ownerBilling.planName}
                features={[
                  t.pricing.ownerPlusIncluded(USER_PLANS.PLUS.includedPets),
                  t.pricing.aiAssistant,
                ]}
                href="/owner"
              />
              <OrgBillingCard
                t={t}
                name={t.shopBilling.yearly}
                price={t.pricing.usd(OWNER_BILLING.year)}
                cadence={t.shopBilling.perYear}
                note={t.ownerBilling.planName}
                features={[
                  t.pricing.ownerPlusIncluded(USER_PLANS.PLUS.includedPets),
                  t.pricing.aiAssistant,
                ]}
                href="/owner"
                highlight
              />
            </div>
            <p className="mt-3 text-xs text-muted">{t.pricing.ownerNote}</p>
          </section>
        </MotionReveal>

        <MotionReveal delay={120}>
          <section className="mt-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              {t.pricing.forShops}
            </h2>
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
              {!offers.early.soldOut && (
                <FoundingBreederLifetimeCard
                  tier="early"
                  mode="marketing"
                  earlyAvailability={offers.early}
                  marketingHref="/shop?founding=1#signup"
                />
              )}
              <FoundingBreederLifetimeCard
                tier="lifetime"
                mode="marketing"
                marketingHref="/shop?founding=1#signup"
              />
              <OrgBillingCard
                t={t}
                name={t.shopBilling.monthly}
                price={t.pricing.usd(SHOP_BILLING.month)}
                cadence={t.pricing.perMonth.trim()}
                features={[
                  t.pricing.shopIncluded(shop.includedPets),
                  t.pricing.shopExtraPet(shop.extraPetPriceUsd),
                  t.pricing.issuePassports,
                  t.pricing.multiSeat,
                  t.pricing.aiAssistant,
                ]}
                href="/shop"
              />
              <OrgBillingCard
                t={t}
                name={t.shopBilling.yearly}
                price={t.pricing.usd(SHOP_BILLING.year)}
                cadence={t.shopBilling.perYear}
                features={[
                  t.pricing.shopIncluded(shop.includedPets),
                  t.pricing.shopExtraPet(shop.extraPetPriceUsd),
                  t.pricing.issuePassports,
                  t.pricing.multiSeat,
                  t.pricing.aiAssistant,
                ]}
                href="/shop"
                highlight
              />
            </div>
            <p className="mt-3 text-xs text-muted">
              {t.shopBilling.starterNote(ORG_PLANS.STARTER.includedPets)}
            </p>
            {!offers.early.soldOut && <BreederPricingFaq />}
          </section>
        </MotionReveal>

        <MotionReveal delay={160}>
          <section className="mt-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
              {t.pricing.forFacilities}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <OrgBillingCard
                t={t}
                name={t.shopBilling.monthly}
                price={t.pricing.usd(SHOP_BILLING.month)}
                cadence={t.pricing.perMonth.trim()}
                features={facilityFeatures}
                href="/facility"
              />
              <OrgBillingCard
                t={t}
                name={t.shopBilling.yearly}
                price={t.pricing.usd(SHOP_BILLING.year)}
                cadence={t.shopBilling.perYear}
                features={facilityFeatures}
                href="/facility"
                highlight
              />
            </div>
            <p className="mt-3 text-xs text-muted">
              {t.shopBilling.facilityStarterNote(ORG_PLANS.STARTER.includedPets)}
            </p>
          </section>
        </MotionReveal>

        <MotionReveal delay={200}>
          <p className="mt-10 text-center text-xs text-muted">
            <Link href="/terms" className="hover:text-forest hover:underline">
              {t.landing.termsOfService}
            </Link>
            {" · "}
            <Link href="/privacy" className="hover:text-forest hover:underline">
              {t.landing.privacyPolicy}
            </Link>
            {" · "}
            <Link href="/disclaimer" className="hover:text-forest hover:underline">
              {t.landing.disclaimer}
            </Link>
          </p>
        </MotionReveal>
      </main>
    </div>
  );
}

function OrgBillingCard({
  t,
  name,
  price,
  cadence,
  features,
  href,
  note,
  highlight,
}: {
  t: Dictionary;
  name: string;
  price: string;
  cadence: string;
  features: string[];
  href: string;
  note?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 ${motionCardHover} ${
        highlight ? "border-brand-400 bg-brand-50/40 shadow-sm" : "border-border bg-surface"
      }`}
    >
      {highlight && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white">
          <Star size={11} /> {t.pricing.mostPopular}
        </span>
      )}
      <h3 className="text-base font-semibold text-foreground">{name}</h3>
      <div className="mt-2 text-3xl font-bold text-foreground">
        {price}
        <span className="text-sm font-normal text-muted"> {cadence}</span>
      </div>
      {note && <p className="mt-2 text-xs text-brand-700">{note}</p>}
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" /> {feature}
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          highlight
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "border border-border text-slate-700 hover:border-brand-300"
        }`}
      >
        {t.pricing.choose}
      </Link>
    </div>
  );
}
