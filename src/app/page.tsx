import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Check,
  User,
  Store,
  Hospital,
  ShieldCheck,
  FileText,
  Lock,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import {
  SectionHeading,
  PathCard,
  StepGrid,
} from "@/components/landing/LandingBlocks";
import { SamplePetPassport } from "@/components/landing/SamplePetPassport";
import { LandingMiniDashboards } from "@/components/landing/LandingMiniDashboards";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Digital Pet Health Passports",
  description:
    "PawSure gives each pet a lifelong digital health passport — trusted care history for breeders, shops, owners, clinics, and boarding facilities.",
  path: "/",
});

const TRUST_ICONS = [Lock, FileText, ShieldCheck];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");
  const { locale, t } = await getI18n();
  const l = t.landing;

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} locale={locale} />

      <section className="relative overflow-hidden">
        <AuroraOrbs subtle />
        <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-22">
          <MotionPop index={0}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
              {l.heroEyebrow}
            </span>
          </MotionPop>
          <MotionPop index={1}>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-forest md:text-5xl">
              {l.heroTitle}
            </h1>
          </MotionPop>
          <MotionPop index={2}>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink/70">{l.heroSubtitle}</p>
          </MotionPop>
          <MotionPop index={3}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#choose"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
              >
                {l.heroPrimary} <ArrowRight size={16} />
              </Link>
              <Link
                href="#sample-passport"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white/90 px-6 py-3 text-sm font-semibold text-forest backdrop-blur transition hover:border-brand-300"
              >
                {l.heroSecondary}
              </Link>
            </div>
          </MotionPop>
          <MotionPop index={4}>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink/60">
              {l.trustBullets.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-sage" /> {item}
                </li>
              ))}
            </ul>
          </MotionPop>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8">
        <MotionReveal>
          <SectionHeading eyebrow={l.howEyebrow} title={l.howTitle} />
        </MotionReveal>
        <MotionReveal delay={80} className="mt-10">
          <StepGrid steps={l.steps} />
        </MotionReveal>
      </section>

      <div className="bg-sand/20">
        <LandingMiniDashboards
          copy={{
            showcaseEyebrow: l.showcaseEyebrow,
            showcaseTitle: l.showcaseTitle,
            showcaseSubtitle: l.showcaseSubtitle,
            showcaseInteractiveHint: l.showcaseInteractiveHint,
            showcaseScreens: l.showcaseScreens,
          }}
        />
      </div>

      <section className="bg-sand/30 py-14">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <MotionReveal>
            <SectionHeading eyebrow={l.sampleEyebrow} title={l.sampleTitle} subtitle={l.sampleDesc} />
          </MotionReveal>
          <MotionReveal delay={100} className="mt-10">
            <SamplePetPassport />
          </MotionReveal>
        </div>
      </section>

      <section id="choose" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <MotionReveal>
          <SectionHeading
            eyebrow={l.chooseEyebrow}
            title={l.chooseTitle}
            subtitle={l.chooseSubtitle}
          />
        </MotionReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <MotionReveal delay={0}>
            <PathCard
              href="/owner"
              icon={<User size={22} />}
              title={l.ownerCardTitle}
              desc={l.ownerCardDesc}
              cta={l.ownerCardCta}
            />
          </MotionReveal>
          <MotionReveal delay={100}>
            <PathCard
              href="/shop"
              icon={<Store size={22} />}
              title={l.shopCardTitle}
              desc={l.shopCardDesc}
              cta={l.shopCardCta}
              highlight
            />
          </MotionReveal>
          <MotionReveal delay={200}>
            <PathCard
              href="/facility"
              icon={<Hospital size={22} />}
              title={l.facilityCardTitle}
              desc={l.facilityCardDesc}
              cta={l.facilityCardCta}
            />
          </MotionReveal>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <MotionReveal>
            <SectionHeading eyebrow={l.trustEyebrow} title={l.trustTitle} />
          </MotionReveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {l.trustItems.map((item, i) => {
              const Icon = TRUST_ICONS[i % TRUST_ICONS.length]!;
              return (
                <MotionReveal key={item.title} delay={i * 60}>
                  <div
                    className={`rounded-2xl border border-border bg-paper p-5 shadow-soft ${motionCardHover}`}
                  >
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-forest">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{item.desc}</p>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <LandingFooter t={t} locale={locale} />
    </div>
  );
}
