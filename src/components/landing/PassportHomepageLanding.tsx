import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Store,
  Heart,
  Building2,
  User,
  QrCode,
  FileUp,
} from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/en";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import {
  SectionHeading,
  BulletList,
  PathCard,
} from "@/components/landing/LandingBlocks";
import { PassportHeroMockup } from "@/components/landing/PassportHeroMockup";
import { SamplePetPassport } from "@/components/landing/SamplePetPassport";
import { LandingMiniDashboards } from "@/components/landing/LandingMiniDashboards";
import { QuickLogFeatureSection } from "@/components/landing/QuickLogFeatureSection";
import { FoundingBreederHomepageOffers } from "@/components/landing/FoundingBreederHomepageOffers";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
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
              <ArrowLeft size={14} /> Demo hub
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
              <h1 className="mt-5 text-3xl font-extrabold leading-[1.12] tracking-tight text-forest md:text-4xl lg:text-[2.65rem]">
                {h.heroTitle}
              </h1>
            </MotionPop>
            <MotionPop index={2}>
              <p className="mt-5 text-base leading-relaxed text-ink/70">{h.heroSubtitle}</p>
            </MotionPop>
            <MotionPop index={3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={SHOP_SIGNUP_HREF}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
                >
                  {h.heroPrimary} <ArrowRight size={16} />
                </Link>
                <Link
                  href={OWNER_SIGNUP_HREF}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-forest bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-forest/90"
                >
                  <User size={16} /> {h.heroOwnerPrimary}
                </Link>
              </div>
              <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3 py-1.5 text-xs font-semibold text-brand-900">
                {h.heroOwnerFreeBadge}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <a
                  href="#sample-passport"
                  className="font-semibold text-brand-700 hover:text-brand-800"
                >
                  {h.heroSecondary} →
                </a>
                <Link
                  href={`${OWNER_SIGNUP_HREF}#start`}
                  className="inline-flex items-center gap-1 font-semibold text-ink/70 hover:text-forest"
                >
                  <QrCode size={14} /> {h.pathsOwnerScan}
                </Link>
              </div>
            </MotionPop>
            <MotionPop index={4}>
              <p className="mt-6 max-w-lg text-[11px] leading-relaxed text-muted">{h.disclaimer}</p>
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

      <section className="border-b border-border bg-surface/80">
        <div className="mx-auto max-w-6xl px-5 py-6 md:px-8">
          <MotionReveal>
            <p className="text-center text-xs font-semibold uppercase tracking-[0.16em] text-sage">
              {h.proofEyebrow}
            </p>
            <p className="mt-2 text-center text-base font-bold text-forest">{h.proofLine}</p>
            <p className="mt-1 text-center text-sm text-muted">{h.proofSubline}</p>
            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-ink/70">
              {h.proofStats.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-sage" /> {item}
                </li>
              ))}
            </ul>
          </MotionReveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-16">
        <MotionReveal>
          <SectionHeading
            eyebrow={h.pathsEyebrow}
            title={h.pathsTitle}
            subtitle={h.pathsSubtitle}
          />
        </MotionReveal>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <MotionReveal delay={0}>
            <div className="flex h-full flex-col rounded-3xl border border-brand-300 bg-brand-50/40 p-7 shadow-soft">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-white">
                <User size={22} />
              </span>
              <h3 className="mt-5 text-xl font-extrabold text-forest">{h.pathsOwnerTitle}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{h.pathsOwnerDesc}</p>
              <ul className="mt-4 flex-1 space-y-2">
                {h.pathsOwnerBullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-ink/75">
                    <Check size={14} className="mt-0.5 shrink-0 text-sage" /> {b}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={OWNER_SIGNUP_HREF}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
                >
                  {h.pathsOwnerCta} <ArrowRight size={15} />
                </Link>
                <Link
                  href={`${OWNER_SIGNUP_HREF}#start`}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-paper px-5 py-2.5 text-sm font-semibold text-forest transition hover:border-brand-300"
                >
                  <QrCode size={15} /> {h.pathsOwnerScan}
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
      </section>

      <section className="border-t border-border bg-sand/15">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <MotionReveal>
            <SectionHeading align="left" eyebrow={h.problemEyebrow} title={h.problemTitle} />
          </MotionReveal>
          <MotionReveal delay={80} className="mt-8 max-w-2xl">
            <BulletList items={h.problemBullets} />
          </MotionReveal>
        </div>
      </section>

      <section className="border-t border-border bg-brand-50/30">
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <MotionReveal>
            <SectionHeading
              align="left"
              eyebrow={t.landing.importEyebrow}
              title={t.landing.importTitle}
              subtitle={t.landing.importDesc}
            />
          </MotionReveal>
          <MotionReveal delay={80} className="mt-8">
            <ul className="grid gap-3 sm:grid-cols-2">
              {t.landing.importBullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink/75"
                >
                  <FileUp size={16} className="mt-0.5 shrink-0 text-brand-600" />
                  {b}
                </li>
              ))}
            </ul>
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
                  eyebrow={h.solutionEyebrow}
                  title={h.solutionTitle}
                  subtitle={h.solutionSubtitle}
                />
              </MotionReveal>
              <MotionReveal delay={100} className="mt-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  {h.solutionSteps.map((s, i) => (
                    <div
                      key={s.title}
                      className={`rounded-2xl border border-border bg-surface p-4 shadow-soft ${motionCardHover}`}
                    >
                      <span className="text-lg font-extrabold text-brand-200">{i + 1}</span>
                      <h3 className="mt-1 text-sm font-bold text-forest">{s.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-ink/70">{s.desc}</p>
                    </div>
                  ))}
                </div>
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

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <MotionReveal>
          <SectionHeading
            eyebrow={h.useCasesEyebrow}
            title={h.useCasesTitle}
            subtitle={h.useCasesSecondary}
          />
        </MotionReveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Heart, card: h.useCaseCards[0] },
            { icon: Building2, card: h.useCaseCards[1] },
            { icon: Store, card: h.useCaseCards[2] },
            { icon: User, card: h.useCaseCards[3], highlight: true },
          ].map(({ icon: Icon, card, highlight }, i) => (
            <MotionReveal key={card.title} delay={i * 60}>
              <div
                className={`flex h-full flex-col rounded-3xl border p-6 shadow-soft ${motionCardHover} ${
                  highlight ? "border-brand-300 bg-brand-50/40" : "border-border bg-surface"
                }`}
              >
                <span
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white ${
                    highlight ? "bg-forest" : "bg-brand-600"
                  }`}
                >
                  <Icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-forest">{card.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{card.desc}</p>
                {highlight ? (
                  <Link
                    href={OWNER_SIGNUP_HREF}
                    className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700"
                  >
                    {h.pathsOwnerCta} <ArrowRight size={14} />
                  </Link>
                ) : null}
              </div>
            </MotionReveal>
          ))}
        </div>
        <MotionReveal delay={200} className="mt-8 text-center">
          <Link href="/facility" className="text-sm font-medium text-muted hover:text-forest">
            {h.facilityLink} →
          </Link>
        </MotionReveal>
      </section>

      <div className="bg-sand/20">
        <LandingMiniDashboards
          defaultRole="shop"
          allowedRoles={["shop", "owner"]}
          copy={{
            showcaseEyebrow: h.dashboardEyebrow,
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
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{h.finalTitle}</h2>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={SHOP_SIGNUP_HREF}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-forest shadow-lg transition hover:bg-brand-50"
              >
                {h.finalCta} <ArrowRight size={16} />
              </Link>
              <Link
                href={OWNER_SIGNUP_HREF}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                {h.finalOwnerCta} <ArrowRight size={16} />
              </Link>
            </div>
            <p className="mx-auto mt-6 max-w-lg text-xs leading-relaxed text-white/70">
              {h.disclaimer}
            </p>
          </MotionReveal>
        </div>
      </section>

      <LandingFooter t={t} locale={locale} />
    </div>
  );
}
