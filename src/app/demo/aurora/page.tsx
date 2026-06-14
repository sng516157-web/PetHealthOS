"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { DemoChrome } from "@/components/demo/DemoChrome";
import { DEMO_LANDING } from "@/components/demo/content";
import {
  AuroraOrbs,
  MotionFloat,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

export default function AuroraDemoPage() {
  const l = DEMO_LANDING;

  return (
    <div className="min-h-screen bg-paper">
      <DemoChrome active="aurora" label="Aurora — soft ambient motion (reference)" />

      <section className="relative overflow-hidden">
        <AuroraOrbs />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[1fr_1.2fr] md:px-8 md:py-24">
          <div>
            <MotionPop index={0}>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
                <Sparkles size={13} /> {l.heroEyebrow}
              </span>
            </MotionPop>
            <MotionPop index={1}>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-forest md:text-5xl">
                {l.heroTitle}
              </h1>
            </MotionPop>
            <MotionPop index={2}>
              <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">{l.heroSubtitle}</p>
            </MotionPop>
            <MotionPop index={3}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="#choose"
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
                >
                  {l.heroPrimary} <ArrowRight size={16} />
                </Link>
                <Link
                  href="#ecosystem"
                  className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white/90 px-6 py-3 text-sm font-semibold text-forest backdrop-blur transition hover:border-brand-300"
                >
                  {l.heroSecondary}
                </Link>
              </div>
            </MotionPop>
            <MotionPop index={4}>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-ink/60">
                {l.trust.map((item) => (
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
                alt="PawSure app preview"
                className="block w-full rounded-[1.5rem]"
              />
            </div>
          </MotionFloat>
        </div>
      </section>

      <section id="ecosystem" className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <MotionReveal className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{l.howEyebrow}</span>
          <h2 className="mt-2 text-2xl font-extrabold text-forest md:text-3xl">{l.howTitle}</h2>
        </MotionReveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {l.steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <MotionReveal key={s.title} delay={i * 120}>
                <div className={`rounded-3xl border border-border bg-surface p-6 shadow-soft ${motionCardHover}`}>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-forest">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.desc}</p>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      <section id="choose" className="bg-sand/30 py-16">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <MotionReveal className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{l.chooseEyebrow}</span>
            <h2 className="mt-2 text-2xl font-extrabold text-forest">{l.chooseTitle}</h2>
          </MotionReveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {l.paths.map((p, i) => {
              const Icon = p.icon;
              return (
                <MotionReveal key={p.title} delay={i * 100}>
                  <div
                    className={`flex h-full flex-col rounded-3xl border p-7 shadow-soft ${motionCardHover} ${
                      p.highlight ? "border-brand-300 bg-brand-50/50" : "border-border bg-surface"
                    }`}
                  >
                    <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
                      <Icon size={22} />
                    </span>
                    <h3 className="mt-5 text-xl font-extrabold text-forest">{p.title}</h3>
                    <p className="mt-2 flex-1 text-sm text-ink/70">{p.desc}</p>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
