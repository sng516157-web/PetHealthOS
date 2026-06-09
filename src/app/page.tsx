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

const STEP_ICONS = [User, Store, Hospital];
const FEATURE_ICONS = [ShieldCheck, Sparkles, CalendarClock, Languages];

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");
  const { t } = await getI18n();
  const l = t.landing;

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-24 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-brand-100/50 blur-3xl" />
          <div className="absolute right-0 top-40 h-64 w-64 rounded-full bg-[#F4C96B]/20 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1fr_1.25fr] md:px-8 md:py-24">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
              <Sparkles size={13} /> {l.heroEyebrow}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-forest md:text-5xl">
              {l.heroTitle}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">
              {l.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#choose"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
              >
                {l.heroPrimary} <ArrowRight size={16} />
              </Link>
              <Link
                href="#ecosystem"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-6 py-3 text-sm font-semibold text-forest transition hover:border-brand-300"
              >
                {l.heroSecondary}
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink/60">
              {[l.trust1, l.trust2, l.trust3].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check size={14} className="text-sage" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative w-full">
            <div className="overflow-hidden rounded-[2rem] border border-border bg-surface p-2 shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/demos/home.gif"
                alt={l.demoHomeAlt}
                className="block w-full rounded-[1.5rem]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ecosystem */}
      <section id="ecosystem" className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <SectionHeading eyebrow={l.howEyebrow} title={l.howTitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {l.steps.map((s, i) => {
            const Icon = STEP_ICONS[i];
            return (
              <div key={s.title} className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon size={20} />
                  </span>
                  <span className="text-3xl font-extrabold text-brand-100">{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-forest">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="bg-sand/30 py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading eyebrow={l.featuresEyebrow} title={l.featuresTitle} />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {l.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={f.title} className="rounded-3xl border border-border bg-surface p-6 shadow-soft">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-forest/10 text-forest">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-forest">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Choose path */}
      <section id="choose" className="mx-auto max-w-6xl px-5 pb-20 pt-16 md:px-8 md:pb-24 md:pt-20">
        <SectionHeading eyebrow={l.chooseEyebrow} title={l.chooseTitle} subtitle={l.chooseSubtitle} />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <PathCard
            href="/owner"
            icon={<User size={22} />}
            title={l.ownerCardTitle}
            desc={l.ownerCardDesc}
            cta={l.ownerCardCta}
          />
          <PathCard
            href="/shop"
            icon={<Store size={22} />}
            title={l.shopCardTitle}
            desc={l.shopCardDesc}
            cta={l.shopCardCta}
            highlight
          />
          <PathCard
            href="/facility"
            icon={<Hospital size={22} />}
            title={l.facilityCardTitle}
            desc={l.facilityCardDesc}
            cta={l.facilityCardCta}
          />
        </div>
      </section>

      <LandingFooter t={t} />
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
      className={`group flex flex-col rounded-3xl border p-7 shadow-soft transition hover:-translate-y-0.5 ${
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
