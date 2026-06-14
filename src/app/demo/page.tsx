"use client";

import {
  ArrowRight,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { DEMO_VARIANTS } from "@/components/demo/content";
import { AuroraOrbs, MotionPop, MotionReveal } from "@/components/motion/aurora";

export default function DemoHubPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <AuroraOrbs subtle className="opacity-60" />
      <div className="relative mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <MotionPop index={0}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
            <Sparkles size={13} /> Motion exploration
          </span>
        </MotionPop>
        <MotionPop index={1}>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-forest md:text-5xl">
            Design previews
          </h1>
        </MotionPop>
        <MotionPop index={2}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
            Review on localhost, pick what feels right, then we&apos;ll merge into production.
          </p>
        </MotionPop>

        <MotionReveal delay={120} className="mt-10">
          <Link
            href="/demo/dashboard"
            className="group flex items-center gap-4 rounded-3xl border border-brand-300 bg-brand-50/50 p-6 shadow-soft transition hover:border-brand-400"
          >
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <LayoutDashboard size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-extrabold text-forest">Dashboard demos</h2>
              <p className="text-sm text-ink/70">
                Owner, shop & facility — full-width desktop + Aurora motion
              </p>
            </div>
            <ArrowRight size={18} className="shrink-0 text-brand-600 transition group-hover:translate-x-0.5" />
          </Link>
        </MotionReveal>

        <MotionReveal delay={200}>
          <h2 className="mt-12 text-sm font-semibold uppercase tracking-[0.18em] text-sage">
            Landing page motion
          </h2>
        </MotionReveal>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {DEMO_VARIANTS.map((v, i) => (
            <MotionReveal key={v.slug} delay={280 + i * 100}>
              <Link
                href={`/demo/${v.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-sage">
                  Option {String.fromCharCode(65 + i)}
                </span>
                <h2 className="mt-2 text-xl font-extrabold text-forest">{v.name}</h2>
                <p className="mt-2 text-sm font-medium text-brand-700">{v.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/65">{v.mood}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
                  Open demo <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            </MotionReveal>
          ))}
        </div>

        <MotionReveal delay={560} className="mt-12 text-center">
          <Link href="/" className="text-sm font-medium text-muted hover:text-forest">
            ← Back to production homepage
          </Link>
        </MotionReveal>
      </div>
    </div>
  );
}
