"use client";

import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { DemoChrome } from "@/components/demo/DemoChrome";
import { DEMO_LANDING } from "@/components/demo/content";
import { Marquee, Reveal } from "@/components/demo/motion";

export default function FlowDemoPage() {
  const l = DEMO_LANDING;

  return (
    <div className="min-h-screen bg-paper">
      <DemoChrome active="flow" label="Flow — connected narrative motion" />

      <Marquee items={l.marquee} />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-50/40 to-transparent" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:px-8 md:py-20">
          <Reveal from="left">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
              <Sparkles size={13} /> {l.heroEyebrow}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-forest md:text-5xl">
              {l.heroTitle}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink/70">{l.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#choose"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
              >
                {l.heroPrimary} <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
          <Reveal from="right" delay={150}>
            <div className="overflow-hidden rounded-[2rem] border border-border bg-surface p-2 shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/demos/home.gif" alt="PawSure app preview" className="block w-full rounded-[1.5rem]" />
            </div>
          </Reveal>
        </div>
      </section>

      <section id="ecosystem" className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <Reveal className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{l.howEyebrow}</span>
          <h2 className="mt-2 text-2xl font-extrabold text-forest md:text-3xl">{l.howTitle}</h2>
        </Reveal>

        <div className="relative mt-12">
          <svg
            className="pointer-events-none absolute left-0 right-0 top-16 hidden h-24 w-full md:block"
            viewBox="0 0 900 80"
            fill="none"
            aria-hidden
          >
            <path
              d="M80 40 H380 Q450 40 450 40 H820"
              stroke="url(#flow-line)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="8 10"
              className="demo-line-draw"
            />
            <defs>
              <linearGradient id="flow-line" x1="0" y1="0" x2="900" y2="0">
                <stop stopColor="#6FAF98" />
                <stop offset="0.5" stopColor="#F4C96B" />
                <stop offset="1" stopColor="#6FAF98" />
              </linearGradient>
            </defs>
          </svg>

          <div className="grid gap-5 md:grid-cols-3">
            {l.steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <Reveal key={s.title} delay={i * 180} from={i === 0 ? "left" : i === 2 ? "right" : "up"}>
                  <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-soft">
                    <span className="absolute -top-3 left-6 rounded-full bg-forest px-2.5 py-0.5 text-[10px] font-bold text-white">
                      Step {i + 1}
                    </span>
                    <span className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-forest">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-14">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {l.features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={i * 90} from={i % 2 === 0 ? "left" : "right"}>
                  <div className="rounded-3xl border border-border bg-paper p-5">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                      <Icon size={18} />
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-forest">{f.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink/65">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <Marquee items={[...l.marquee].reverse()} />

      <section id="choose" className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <Reveal className="text-center">
          <h2 className="text-2xl font-extrabold text-forest">{l.chooseTitle}</h2>
        </Reveal>
        <ul className="mx-auto mt-8 max-w-md space-y-3">
          {l.trust.map((item, i) => (
            <Reveal key={item} delay={i * 80} from="left">
              <li className="demo-slide-right flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm font-medium text-forest">
                <Check size={16} className="shrink-0 text-sage" /> {item}
              </li>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  );
}
