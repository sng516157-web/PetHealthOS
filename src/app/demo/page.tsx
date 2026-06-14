"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { DEMO_VARIANTS } from "@/components/demo/content";
import { FloatingOrbs, Reveal } from "@/components/demo/motion";

export default function DemoHubPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-paper">
      <FloatingOrbs />
      <div className="relative mx-auto max-w-4xl px-5 py-16 md:px-8 md:py-24">
        <Reveal>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
            <Sparkles size={13} /> Motion exploration
          </span>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-forest md:text-5xl">
            Livelier landing pages
          </h1>
        </Reveal>
        <Reveal delay={160}>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink/70">
            Three motion directions built on the PawSure brand — review on localhost, pick what
            feels right, and we&apos;ll merge the winner into the real homepage.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {DEMO_VARIANTS.map((v, i) => (
            <Reveal key={v.slug} delay={240 + i * 100}>
              <Link
                href={`/demo/${v.slug}`}
                className="demo-tilt group flex h-full flex-col rounded-3xl border border-border bg-surface p-6 shadow-soft"
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
            </Reveal>
          ))}
        </div>

        <Reveal delay={560} className="mt-12 text-center">
          <Link href="/" className="text-sm font-medium text-muted hover:text-forest">
            ← Back to current production homepage
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
