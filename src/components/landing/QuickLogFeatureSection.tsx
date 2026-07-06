import { ArrowDown, Sparkles } from "lucide-react";
import { Badge, type Tone } from "@/components/ui";
import { LOG_BUCKET_META, type LogBucket } from "@/lib/constants";
import { SectionHeading } from "@/components/landing/LandingBlocks";
import { MotionReveal } from "@/components/motion/aurora";
import type { landingEn } from "@/lib/i18n/landing-en";

type Copy = (typeof landingEn)["homepageV2"]["quickLogFeature"];

export function QuickLogFeatureSection({ copy }: { copy: Copy }) {
  return (
    <section className="border-t border-border bg-brand-50/20">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
        <MotionReveal>
          <SectionHeading
            eyebrow={copy.eyebrow}
            title={copy.title}
            subtitle={copy.subtitle}
          />
        </MotionReveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] lg:items-start">
          <MotionReveal delay={60}>
            <div className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sage">
                {copy.inputLabel}
              </p>
              <p className="mt-3 rounded-2xl border border-brand-200 bg-brand-50/50 px-4 py-3 text-sm leading-relaxed text-forest">
                {copy.exampleNote}
              </p>
            </div>
          </MotionReveal>

          <MotionReveal delay={100} className="flex justify-center lg:pt-16">
            <div className="flex flex-col items-center gap-2 text-brand-700">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
                <Sparkles size={18} />
              </span>
              <p className="max-w-[8rem] text-center text-xs font-semibold">{copy.structuringLabel}</p>
              <ArrowDown size={18} className="hidden text-brand-400 lg:block" />
            </div>
          </MotionReveal>

          <MotionReveal delay={140}>
            <div className="space-y-3">
              {copy.outputs.map((out) => {
                const meta = LOG_BUCKET_META[out.bucket as LogBucket];
                return (
                  <div
                    key={out.bucket}
                    className="rounded-2xl border border-border bg-surface px-4 py-3 shadow-soft"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={meta.color as Tone}>
                        {meta.emoji} {out.label}
                      </Badge>
                      <span className="text-xs font-medium text-muted">{out.time}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-forest">{out.title}</p>
                    <p className="mt-0.5 text-xs text-ink/70">{out.summary}</p>
                  </div>
                );
              })}
            </div>
          </MotionReveal>
        </div>

        <MotionReveal delay={180} className="mt-8">
          <ul className="grid gap-3 sm:grid-cols-2">
            {copy.bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink/75"
              >
                <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-600" />
                {b}
              </li>
            ))}
          </ul>
        </MotionReveal>
      </div>
    </section>
  );
}
