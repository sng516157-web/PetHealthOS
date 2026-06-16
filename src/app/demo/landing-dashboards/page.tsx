import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import { LandingDashboardShowcase } from "@/components/landing/LandingDashboardShowcase";
import { SectionHeading, StepGrid } from "@/components/landing/LandingBlocks";
import { AuroraOrbs, MotionReveal } from "@/components/motion/aurora";

/** Preview only — homepage dashboard section (same component as `/`). */
export default async function LandingDashboardsDemoPage() {
  const { locale, t } = await getI18n();
  const l = t.landing;

  return (
    <div className="min-h-screen bg-paper">
      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-8">
          <p className="text-sm font-medium text-amber-900">
            <span className="font-semibold">Preview mirror</span> — same interactive block as
            production `/` (between How it works and sample passport).
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-900 hover:underline"
          >
            <ArrowLeft size={15} /> Demo hub
          </Link>
        </div>
      </div>

      <LandingHeader t={t} locale={locale} />

      <section className="relative overflow-hidden border-b border-border">
        <AuroraOrbs subtle />
        <div className="relative mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
            <LayoutDashboard size={13} /> Homepage section preview
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-forest md:text-4xl">
            Interactive mini dashboards
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/70">
            Click through owner, shop, and facility workspaces — open pets, switch tabs, try forms.
            This block sits after &quot;How PawSure works&quot; and before the sample passport.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <MotionReveal>
          <SectionHeading eyebrow={l.howEyebrow} title={l.howTitle} />
        </MotionReveal>
        <MotionReveal delay={60} className="mt-8 opacity-40">
          <StepGrid steps={l.steps} />
        </MotionReveal>
        <p className="mt-4 text-center text-xs text-muted">↑ Existing section (dimmed for context)</p>
      </section>

      <div className="bg-sand/20">
        <LandingDashboardShowcase
          copy={{
            showcaseEyebrow: l.showcaseEyebrow,
            showcaseTitle: l.showcaseTitle,
            showcaseSubtitle: l.showcaseSubtitle,
            showcaseInteractiveHint: l.showcaseInteractiveHint,
            showcaseScreens: l.showcaseScreens,
          }}
        />
      </div>

      <section className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <MotionReveal>
          <SectionHeading eyebrow={l.sampleEyebrow} title={l.sampleTitle} />
        </MotionReveal>
        <p className="mt-4 text-center text-xs text-muted">
          ↓ Sample passport section follows on the real homepage
        </p>
      </section>

      <LandingFooter t={t} locale={locale} />
    </div>
  );
}
