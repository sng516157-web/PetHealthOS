"use client";

import Link from "next/link";
import { ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";
import { DASHBOARD_DEMO_VARIANTS } from "@/components/demo/dashboard/mock-data";
import { AuroraOrbs, MotionPop, MotionReveal } from "@/components/motion/aurora";

export default function DashboardDemoHubPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <AuroraOrbs subtle className="opacity-60" />
      <div className="relative mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <MotionPop index={0}>
          <Link
            href="/demo"
            className="text-sm font-medium text-muted hover:text-forest"
          >
            ← All motion demos
          </Link>
        </MotionPop>
        <MotionPop index={1}>
          <span className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
            <LayoutDashboard size={13} /> Dashboard exploration
          </span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-forest md:text-5xl">
            Reimagined workspaces
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
            Full-width desktop layouts with Aurora motion — one demo per account type. Compare
            against the live <code className="text-sm">/me</code> and{" "}
            <code className="text-sm">/app</code> dashboards.
          </p>
        </MotionPop>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {DASHBOARD_DEMO_VARIANTS.map((v, i) => (
            <MotionReveal key={v.slug} delay={200 + i * 100}>
              <Link
                href={`/demo/dashboard/${v.slug}`}
                className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-6 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-[0_14px_36px_rgba(36,89,76,0.12)]"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-sage">
                  {v.slug}
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

        <MotionReveal delay={500} className="mt-10 rounded-2xl border border-border bg-surface/80 p-5">
          <p className="flex items-start gap-2 text-sm text-ink/70">
            <Sparkles size={16} className="mt-0.5 shrink-0 text-sage" />
            <span>
              <strong className="text-forest">Why demos?</strong> Production owner dashboards use{" "}
              <code className="text-xs">max-w-3xl</code>, which feels narrow on large screens.
              These previews use up to <code className="text-xs">1600px</code> canvas width with
              multi-column bento layouts.
            </span>
          </p>
        </MotionReveal>
      </div>
    </div>
  );
}
