"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { DemoChrome } from "@/components/demo/DemoChrome";
import { DEMO_LANDING } from "@/components/demo/content";
import { CountUp, Reveal, useTilt } from "@/components/demo/motion";

function TiltPathCard({
  icon,
  title,
  desc,
  highlight,
}: {
  icon: ReactNode;
  title: string;
  desc: string;
  highlight?: boolean;
}) {
  const tilt = useTilt();
  return (
    <div
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      className={`demo-tilt demo-icon-wiggle flex h-full flex-col rounded-3xl border p-7 shadow-soft ${
        highlight ? "border-brand-300 bg-brand-50/40" : "border-border bg-surface"
      }`}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-extrabold text-forest">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{desc}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
        Explore <ArrowRight size={16} />
      </span>
    </div>
  );
}

export default function LiftDemoPage() {
  const l = DEMO_LANDING;

  return (
    <div className="min-h-screen bg-paper">
      <DemoChrome active="lift" label="Lift — tactile micro-interactions" />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-20 top-10 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <Reveal>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
                <Sparkles size={13} /> {l.heroEyebrow}
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-forest md:text-5xl">
                {l.heroTitle}
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-ink/70">{l.heroSubtitle}</p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="#choose"
                  className="demo-shimmer-btn inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-ps-button"
                >
                  {l.heroPrimary} <ArrowRight size={16} />
                </Link>
                <Link
                  href="#ecosystem"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-6 py-3 text-sm font-semibold text-forest transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-soft"
                >
                  {l.heroSecondary}
                </Link>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <div className="grid grid-cols-3 gap-3 rounded-3xl border border-border bg-surface p-5 shadow-soft">
                {l.stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl font-extrabold text-forest">
                      <CountUp to={s.value} />
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 overflow-hidden rounded-[1.75rem] border border-border bg-surface p-2 shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/demos/home.gif" alt="PawSure app preview" className="block w-full rounded-[1.25rem]" />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="ecosystem" className="border-y border-border bg-sand/25 py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <Reveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{l.howEyebrow}</span>
            <h2 className="mt-2 text-2xl font-extrabold text-forest">{l.howTitle}</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {l.steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 100}>
                  <div className="demo-tilt demo-icon-wiggle rounded-3xl border border-border bg-surface p-6 shadow-soft">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-forest">{s.title}</h3>
                    <p className="mt-2 text-sm text-ink/70">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {l.features.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 80}>
                <div className="demo-tilt flex gap-4 rounded-2xl border border-border bg-surface p-5 shadow-soft">
                  <span className="demo-icon-wiggle inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-forest">
                    <Icon size={20} />
                  </span>
                  <div>
                    <h3 className="font-bold text-forest">{f.title}</h3>
                    <p className="mt-1 text-sm text-ink/65">{f.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="choose" className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <Reveal className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{l.chooseEyebrow}</span>
          <h2 className="mt-2 text-2xl font-extrabold text-forest">{l.chooseTitle}</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {l.paths.map((p, i) => {
            const Icon = p.icon;
            return (
              <Reveal key={p.title} delay={i * 120}>
                <TiltPathCard
                  icon={<Icon size={22} />}
                  title={p.title}
                  desc={p.desc}
                  highlight={p.highlight}
                />
              </Reveal>
            );
          })}
        </div>
      </section>
    </div>
  );
}
