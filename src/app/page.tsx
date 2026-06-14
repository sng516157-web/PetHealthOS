import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ShieldCheck,
  Sparkles,
  CalendarClock,
  Languages,
  ArrowRight,
  User,
  Store,
  Hospital,
  Check,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import {
  AuroraOrbs,
  MotionFloat,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Lifelong Pet Health Passports",
  description:
    "PawSure helps breeders, pet shops, and hospitals issue trusted digital health passports — with AI logs, reminders, and seamless handoff to new pet owners.",
  path: "/",
});

const STEP_ICONS = [User, Store, Hospital];
const FEATURE_ICONS = [ShieldCheck, Sparkles, CalendarClock, Languages];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");
  const { locale, t } = await getI18n();
  const l = t.landing;

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} locale={locale} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <AuroraOrbs subtle />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1fr_1.25fr] md:px-8 md:py-24">
          <div>
            <MotionPop index={0}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
                <Sparkles size={13} /> {l.heroEyebrow}
              </span>
            </MotionPop>
            <MotionPop index={1}>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-forest md:text-5xl">
                {l.heroTitle}
              </h1>
            </MotionPop>
            <MotionPop index={2}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
                {l.heroSubtitle}
              </p>
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
                  href="#ecosystem"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white/90 px-6 py-3 text-sm font-semibold text-forest backdrop-blur transition hover:border-brand-300"
                >
                  {l.heroSecondary}
                </Link>
              </div>
            </MotionPop>
            <MotionPop index={4}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink/60">
                {[l.trust1, l.trust2, l.trust3].map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <Check size={14} className="text-sage" /> {item}
                  </li>
                ))}
              </ul>
            </MotionPop>
          </div>

          <MotionFloat className="w-full">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-surface p-2 shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/demos/home.gif"
                alt={l.demoHomeAlt}
                className="block w-full rounded-[1.5rem]"
              />
            </div>
          </MotionFloat>
        </div>
      </section>

      {/* Ecosystem */}
      <section id="ecosystem" className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <MotionReveal>
          <SectionHeading eyebrow={l.howEyebrow} title={l.howTitle} />
        </MotionReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {l.steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <MotionReveal key={s.title} delay={i * 100}>
                <div
                  className={`rounded-3xl border border-border bg-surface p-6 shadow-soft ${motionCardHover}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon size={20} />
                    </span>
                    <span className="text-3xl font-extrabold text-brand-100">{i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-forest">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.desc}</p>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-sand/30 py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <MotionReveal>
            <SectionHeading eyebrow={l.featuresEyebrow} title={l.featuresTitle} />
          </MotionReveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {l.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <MotionReveal key={f.title} delay={i * 80}>
                  <div
                    className={`rounded-3xl border border-border bg-surface p-6 shadow-soft ${motionCardHover}`}
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-4 text-base font-bold text-forest">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{f.desc}</p>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Choose path */}
      <section id="choose" className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:px-8 md:pb-24 md:pt-20">
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

      <LandingFooter t={t} locale={locale} />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{eyebrow}</span>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-forest md:text-3xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-2 max-w-xl text-sm text-ink/65">{subtitle}</p>}
    </div>
  );
}

function PathCard({
  href,
  icon,
  title,
  desc,
  cta,
  highlight,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex h-full flex-col rounded-3xl border p-7 shadow-soft transition hover:-translate-y-0.5 ${motionCardHover} ${
        highlight ? "border-brand-300 bg-brand-50/40" : "border-border bg-surface"
      }`}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-extrabold text-forest">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{desc}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
        {cta} <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
