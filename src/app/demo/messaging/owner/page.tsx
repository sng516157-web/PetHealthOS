import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Info, User } from "lucide-react";
import { messagingDemo } from "@/lib/demo/messaging-copy";
import { MessagingDemoChrome } from "@/components/demo/messaging/MessagingDemoChrome";
import {
  SectionHeading,
  BulletList,
  PricingPreview,
} from "@/components/demo/messaging/LandingBlocks";
import { SamplePetPassport } from "@/components/demo/messaging/SamplePetPassport";
import { OwnerStartPanel } from "@/components/OwnerStartPanel";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

export default function MessagingOwnerDemo() {
  const o = messagingDemo.owner;

  return (
    <>
      <MessagingDemoChrome active="/demo/messaging/owner" />

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
                  <User size={13} /> {o.eyebrow}
                </span>
              </MotionPop>
              <MotionPop index={2}>
                <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-forest md:text-4xl">
                  {o.title}
                </h1>
              </MotionPop>
              <MotionPop index={3}>
                <p className="mt-4 max-w-md text-base leading-relaxed text-ink/70">{o.subtitle}</p>
              </MotionPop>
              <MotionPop index={4}>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/owner"
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
                  >
                    {o.heroPrimary} <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="/owner#scan"
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-forest transition hover:border-brand-300"
                  >
                    {o.heroSecondary}
                  </Link>
                </div>
              </MotionPop>

              <MotionReveal delay={80} className="mt-10">
                <SectionHeading
                  align="left"
                  eyebrow={o.trackEyebrow}
                  title={o.trackTitle}
                />
                <div
                  className={`mt-4 rounded-3xl border border-border bg-surface p-6 shadow-soft ${motionCardHover}`}
                >
                  <BulletList items={o.trackItems} />
                </div>
              </MotionReveal>

              <MotionReveal delay={120} className="mt-10">
                <SectionHeading
                  align="left"
                  eyebrow={o.shareEyebrow}
                  title={o.shareTitle}
                  subtitle={o.shareDesc}
                />
                <ul className="mt-4 space-y-2">
                  {o.shareBullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-ink/75">
                      <Check size={16} className="mt-0.5 shrink-0 text-sage" />
                      {b}
                    </li>
                  ))}
                </ul>
              </MotionReveal>

              <MotionReveal delay={160} className="mt-10">
                <SectionHeading
                  align="left"
                  eyebrow={o.controlEyebrow}
                  title={o.controlTitle}
                />
                <ul className="mt-4 space-y-2">
                  {o.controlBullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-ink/75">
                      <Check size={16} className="mt-0.5 shrink-0 text-sage" />
                      {b}
                    </li>
                  ))}
                </ul>
              </MotionReveal>

              <MotionReveal delay={200}>
                <p className="mt-6 flex items-start gap-2 rounded-2xl bg-[#F4C96B]/15 px-4 py-3 text-xs leading-relaxed text-ink/70">
                  <Info size={15} className="mt-0.5 shrink-0 text-[#b88a2a]" />
                  {o.aiNote}
                </p>
              </MotionReveal>

              <MotionReveal delay={240} className="mt-10">
                <PricingPreview
                  eyebrow={o.pricingEyebrow}
                  title={o.pricingTitle}
                  desc={o.pricingDesc}
                  cta={o.pricingCta}
                  href="/owner"
                />
              </MotionReveal>
            </div>

            <div className="space-y-8">
              <MotionReveal delay={100}>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                  {o.startEyebrow}
                </span>
                <div className="mt-3">
                  <OwnerStartPanel />
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
                  eyebrow={messagingDemo.home.sampleEyebrow}
                  title="Example passport after scan"
                  subtitle="What a new owner might inherit from a breeder or shop."
                />
                <div className="mt-4">
                  <SamplePetPassport compact />
                </div>
              </MotionReveal>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
