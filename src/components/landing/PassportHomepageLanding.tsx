import Link from "next/link";
import { ArrowRight, Check, Store, User, FileUp } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/en";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import {
  SectionHeading,
  BulletList,
  PathCard,
} from "@/components/landing/LandingBlocks";
import { LandingRolePicker } from "@/components/landing/LandingRolePicker";
import { PassportHeroMockup } from "@/components/landing/PassportHeroMockup";
import { SamplePetPassport } from "@/components/landing/SamplePetPassport";
import { LandingMiniDashboards } from "@/components/landing/LandingMiniDashboards";
import { QuickLogFeatureSection } from "@/components/landing/QuickLogFeatureSection";
import { FoundingBreederHomepageOffers } from "@/components/landing/FoundingBreederHomepageOffers";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
} from "@/components/motion/aurora";

const SHOP_SIGNUP_HREF = "/shop";
const OWNER_SIGNUP_HREF = "/owner";

type Props = {
  locale: Locale;
  t: Dictionary;
  /** Amber banner for `/demo/homepage-v2` — production `/` omits this. */
  previewBanner?: boolean;
  founding?: {
    early: {
      limit: number;
      claimed: number;
      remaining: number;
      soldOut: boolean;
    };
  } | null;
};

export function PassportHomepageLanding({ locale, t, previewBanner, founding }: Props) {
  const h = t.landing.homepageV2;

  return (
    <div className="min-h-screen bg-paper">
      {previewBanner ? (
        <div className="border-b border-amber-200 bg-amber-50">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
            <p className="text-sm font-medium text-amber-900">
              <span className="font-semibold">Preview archive</span> — this layout is now live on{" "}
              <Link href="/" className="font-semibold underline hover:no-underline">
                /
              </Link>
              .
            </p>
            <Link
              href="/demo"
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-900 hover:underline"
            >
              Demo hub
            </Link>
          </div>
        </div>
      ) : null}

      <LandingHeader t={t} locale={locale} />

      <section className="relative overflow-hidden border-b border-border/60">
        <AuroraOrbs subtle />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 md:px-8 md:py-20 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1">
            <MotionPop index={0}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
                {h.heroEyebrow}
              </span>
            </MotionPop>
            <MotionPop index={1}>
              <h1 className="mt-5 text-balance text-3xl font-extrabold leading-[1.12] tracking-tight text-forest md:text-4xl lg:text-[2.65rem]">
                {h.heroTitle}
              </h1>
            </MotionPop>
            <MotionPop index={2}>
              <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-forest/80">
                {h.heroSubtitle}
              </p>
            </MotionPop>
            <MotionPop index={3} className="mt-8">
              <LandingRolePicker
                copy={{
                  rolePickerPrompt: h.rolePickerPrompt,
                  roleBreeder: h.roleBreeder,
                  roleOwner: h.roleOwner,
                  heroPrimary: h.heroPrimary,
                  heroOwnerPrimary: h.heroOwnerPrimary,
                  heroOwnerFreeBadge: h.heroOwnerFreeBadge,
                  heroSecondary: h.heroSecondary,
                  pathsOwnerScan: h.pathsOwnerScan,
                }}
              />
            </MotionPop>
            <MotionPop index={4}>
              <p className="mt-6 max-w-lg text-xs leading-relaxed text-forest/65">{h.disclaimer}</p>
            </MotionPop>
          </div>
          <MotionPop index={2} className="order-1 lg:order-2">
            <PassportHeroMockup />
          </MotionPop>
        </div>
      </section>

      {founding && (
        <FoundingBreederHomepageOffers
          h={h}
          early={founding.early}
          shopSignupHref={SHOP_SIGNUP_HREF}
        />
      )}

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <MotionReveal>
          <SectionHeading title={h.pathsTitle} subtitle={h.pathsSubtitle} />
        </MotionReveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <MotionReveal delay={0}>
            <div className="flex h-full flex-col rounded-3xl border border-brand-300 bg-brand-50/40 p-7 shadow-soft">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-white">
                <User size={22} />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-forest">{h.pathsOwnerTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-forest/80">{h.pathsOwnerDesc}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {h.pathsOwnerBullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-forest/85">
                    <Check size={14} className="mt-0.5 shrink-0 text-sage" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <Link
                  href={OWNER_SIGNUP_HREF}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
                >
                  {h.pathsOwnerCta} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </MotionReveal>
          <MotionReveal delay={80}>
            <PathCard
              href={SHOP_SIGNUP_HREF}
              icon={<Store size={22} />}
              title={h.pathsBreederTitle}
              desc={h.pathsBreederDesc}
              cta={h.pathsBreederCta}
            />
          </MotionReveal>
        </div>
        <MotionReveal delay={120} className="mt-6 text-center">
          <Link href="/facility" className="text-sm font-medium text-forest/70 hover:text-forest">
            {h.facilityLink} →
          </Link>
        </MotionReveal>
      </section>

      <section className="border-t border-border bg-sand/15">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <MotionReveal>
            <SectionHeading align="left" title={h.problemTitle} />
          </MotionReveal>
          <MotionReveal delay={80} className="mt-8 max-w-2xl">
            <BulletList items={h.problemBullets} />
          </MotionReveal>
          <MotionReveal delay={120} className="mt-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
              {t.landing.importEyebrow}
            </p>
            <h3 className="mt-2 text-lg font-bold text-forest">{t.landing.importTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-forest/80">{t.landing.importDesc}</p>
            <ol className="mt-6 grid gap-4 sm:grid-cols-3">
              {t.landing.importSteps.map((step, i) => (
                <li key={step.title} className="rounded-2xl border border-border bg-white/70 p-4">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <h4 className="mt-3 text-sm font-bold text-forest">{step.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-forest/75">{step.desc}</p>
                </li>
              ))}
            </ol>
            <ul className="mt-6 space-y-2">
              {t.landing.importBullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm text-forest/85">
                  <FileUp size={16} className="mt-0.5 shrink-0 text-brand-600" />
                  {b}
                </li>
              ))}
            </ul>
            <Link
              href="/shop#signup"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
            >
              {t.landing.importCta}
            </Link>
          </MotionReveal>
        </div>
      </section>

      <QuickLogFeatureSection copy={h.quickLogFeature} />

      <section className="border-y border-border bg-sand/25 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            <div>
              <MotionReveal>
                <SectionHeading
                  align="left"
                  title={h.solutionTitle}
                  subtitle={h.solutionSubtitle}
                />
              </MotionReveal>
              <MotionReveal delay={100} className="mt-8">
                <ol className="space-y-6">
                  {h.solutionSteps.map((s, i) => (
                    <li key={s.title} className="flex gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="text-base font-bold text-forest">{s.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-forest/80">{s.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </MotionReveal>
            </div>
            <MotionReveal delay={120}>
              <div id="sample-passport">
                <SamplePetPassport compact />
              </div>
            </MotionReveal>
          </div>
        </div>
      </section>

      <div className="bg-sand/20">
        <LandingMiniDashboards
          defaultRole="shop"
          allowedRoles={["shop", "owner"]}
          copy={{
            showcaseTitle: h.dashboardTitle,
            showcaseSubtitle: h.dashboardSubtitle,
            showcaseInteractiveHint: h.dashboardHint,
            showcaseScreens: t.landing.showcaseScreens,
          }}
        />
      </div>

      <section className="border-t border-border bg-forest py-16 text-white md:py-20">
        <div className="mx-auto max-w-6xl px-5 text-center md:px-8">
          <MotionReveal>
            <h2 className="text-balance text-2xl font-extrabold tracking-tight md:text-3xl">
              {h.finalTitle}
            </h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={SHOP_SIGNUP_HREF}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-forest shadow-lg transition hover:bg-brand-50"
              >
                {h.finalCta} <ArrowRight size={16} />
              </Link>
              <Link
                href={OWNER_SIGNUP_HREF}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/25"
              >
                {h.finalOwnerCta} <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mx-auto mt-6 max-w-lg text-xs leading-relaxed text-white/80">
              {h.disclaimer}
            </p>
          </MotionReveal>
        </div>
      </section>

      <LandingFooter t={t} locale={locale} />
    </div>
  );
}
