import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Hospital } from "lucide-react";
import { messagingDemo } from "@/lib/demo/messaging-copy";
import { MessagingDemoChrome } from "@/components/demo/messaging/MessagingDemoChrome";
import {
  SectionHeading,
  PricingPreview,
} from "@/components/demo/messaging/LandingBlocks";
import { SampleStayReport } from "@/components/demo/messaging/SampleStayReport";
import { AuthCard } from "@/components/AuthCard";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

export default function MessagingFacilityDemo() {
  const f = messagingDemo.facility;

  return (
    <>
      <MessagingDemoChrome active="/demo/messaging/facility" />

      <main className="relative overflow-hidden">
        <AuroraOrbs subtle className="-z-10" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <MotionPop index={0}>
            <Link
              href="/demo/messaging"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest"
            >
              <ArrowLeft size={14} /> Back to overview
            </Link>
          </MotionPop>

          <div className="mt-6 grid gap-12 lg:grid-cols-2 lg:gap-14">
            <div>
              <MotionPop index={1}>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
                  <Hospital size={13} /> {f.eyebrow}
                </span>
              </MotionPop>
              <MotionPop index={2}>
                <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-forest md:text-4xl">
                  {f.title}
                </h1>
              </MotionPop>
              <MotionPop index={3}>
                <p className="mt-4 max-w-md text-base leading-relaxed text-ink/70">{f.subtitle}</p>
              </MotionPop>
              <MotionPop index={4}>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/facility"
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
                  >
                    {f.heroPrimary} <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="#sample-stay"
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-forest transition hover:border-brand-300"
                  >
                    {f.heroSecondary}
                  </Link>
                </div>
              </MotionPop>

              <MotionReveal delay={80} className="mt-10">
                <SectionHeading align="left" eyebrow={f.builtEyebrow} title={f.builtTitle} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {f.builtItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-forest"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </MotionReveal>

              <MotionReveal delay={120} className="mt-10">
                <SectionHeading align="left" eyebrow={f.accessEyebrow} title={f.accessTitle} />
                <ol className="mt-4 space-y-3">
                  {f.accessSteps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm text-ink/75">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </MotionReveal>

              <MotionReveal delay={160} className="mt-10">
                <SectionHeading align="left" eyebrow={f.logEyebrow} title={f.logTitle} />
                <ul className="mt-4 space-y-2">
                  {f.logItems.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-ink/75">
                      <Check size={16} className="mt-0.5 shrink-0 text-sage" />
                      {b}
                    </li>
                  ))}
                </ul>
              </MotionReveal>

              <MotionReveal delay={200} className="mt-10">
                <SectionHeading align="left" eyebrow={f.trustEyebrow} title={f.trustTitle} />
                <div
                  className={`mt-4 rounded-3xl border border-border bg-surface p-6 shadow-soft ${motionCardHover}`}
                >
                  <ul className="space-y-2">
                    {f.trustItems.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-sm text-ink/75">
                        <Check size={16} className="mt-0.5 shrink-0 text-sage" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </MotionReveal>

              <MotionReveal delay={240} className="mt-10">
                <PricingPreview
                  eyebrow={f.pricingEyebrow}
                  title={f.pricingTitle}
                  desc={f.pricingDesc}
                  cta={f.pricingCta}
                  href="/facility"
                />
              </MotionReveal>
            </div>

            <div className="space-y-8">
              <MotionReveal delay={100}>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                  {f.loginTitle}
                </span>
                <div className="mt-3">
                  <AuthCard accountType="facility" defaultTab="register" />
                </div>
                <p className="mt-4 text-center text-xs text-muted">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                    Sign in
                  </Link>
                </p>
              </MotionReveal>

              <MotionReveal delay={180}>
                <SectionHeading
                  align="left"
                  eyebrow={f.sampleEyebrow}
                  title={f.sampleTitle}
                  subtitle={f.sampleDesc}
                />
                <div className="mt-4">
                  <SampleStayReport />
                </div>
              </MotionReveal>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
