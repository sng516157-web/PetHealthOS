import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Store } from "lucide-react";
import { messagingDemo } from "@/lib/demo/messaging-copy";
import { SHOP_BILLING, OWNER_BILLING } from "@/lib/plans";
import { formatUsd } from "@/lib/money";
import { MessagingDemoChrome } from "@/components/demo/messaging/MessagingDemoChrome";
import {
  SectionHeading,
  PricingPreview,
} from "@/components/demo/messaging/LandingBlocks";
import { SamplePetPassport } from "@/components/demo/messaging/SamplePetPassport";
import { AuthCard } from "@/components/AuthCard";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";

export default function MessagingShopDemo() {
  const s = messagingDemo.shop;

  const diffRows = [
    { label: "Pets", owner: "1 free, up to 10", shop: "Many — plan based" },
    { label: "Issue passports", owner: "No", shop: "Yes (once verified)" },
    { label: "Lineage & litters", owner: "Basic", shop: "Yes" },
    {
      label: "Price",
      owner: `Free + Owner Plus from ${formatUsd(OWNER_BILLING.month)}/mo (5 pets)`,
      shop: `${formatUsd(SHOP_BILLING.month)}/mo · ${formatUsd(SHOP_BILLING.year)}/yr`,
    },
  ];

  return (
    <>
      <MessagingDemoChrome active="/demo/messaging/shop" />

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
                  <Store size={13} /> {s.eyebrow}
                </span>
              </MotionPop>
              <MotionPop index={2}>
                <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-forest md:text-4xl">
                  {s.title}
                </h1>
              </MotionPop>
              <MotionPop index={3}>
                <p className="mt-4 max-w-md text-base leading-relaxed text-ink/70">{s.subtitle}</p>
              </MotionPop>
              <MotionPop index={4}>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
                  >
                    {s.heroPrimary} <ArrowRight size={15} />
                  </Link>
                  <Link
                    href="#sample-passport"
                    className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-forest transition hover:border-brand-300"
                  >
                    {s.heroSecondary}
                  </Link>
                </div>
              </MotionPop>

              <MotionReveal delay={80} className="mt-10">
                <SectionHeading align="left" eyebrow={s.whyEyebrow} title={s.whyTitle} />
                <ul className="mt-4 space-y-2">
                  {s.whyItems.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-ink/75">
                      <Check size={16} className="mt-0.5 shrink-0 text-sage" />
                      {b}
                    </li>
                  ))}
                </ul>
              </MotionReveal>

              <MotionReveal delay={120} className="mt-10">
                <SectionHeading align="left" eyebrow={s.recordEyebrow} title={s.recordTitle} />
                <div className="mt-4 flex flex-wrap gap-2">
                  {s.recordItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-forest"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </MotionReveal>

              <MotionReveal delay={160} className="mt-10">
                <SectionHeading
                  align="left"
                  eyebrow={s.handoverEyebrow}
                  title={s.handoverTitle}
                />
                <ol className="mt-4 space-y-3">
                  {s.handoverSteps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm text-ink/75">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </MotionReveal>

              <MotionReveal delay={200} className="mt-10">
                <SectionHeading
                  align="left"
                  eyebrow={s.diffTitle}
                  title={s.diffSubtitle}
                />
                <div
                  className={`mt-4 overflow-hidden rounded-3xl border border-border bg-surface shadow-soft ${motionCardHover}`}
                >
                  <div className="grid grid-cols-3 bg-forest/5 px-4 py-3 text-xs font-semibold text-forest">
                    <span>Feature</span>
                    <span className="text-center">Owner</span>
                    <span className="text-center">Shop</span>
                  </div>
                  {diffRows.map((r, i) => (
                    <div
                      key={r.label}
                      className={`grid grid-cols-3 items-center px-4 py-3 text-xs ${
                        i % 2 ? "bg-paper/60" : ""
                      }`}
                    >
                      <span className="font-medium text-ink/80">{r.label}</span>
                      <span className="text-center text-muted">{r.owner}</span>
                      <span className="text-center font-medium text-forest">{r.shop}</span>
                    </div>
                  ))}
                </div>
              </MotionReveal>

              <MotionReveal delay={240} className="mt-10">
                <PricingPreview
                  eyebrow={s.pricingEyebrow}
                  title={s.pricingTitle}
                  desc={s.pricingDesc}
                  cta={s.pricingCta}
                  href="/shop"
                />
              </MotionReveal>
            </div>

            <div className="space-y-8">
              <MotionReveal delay={100}>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                  {s.loginTitle}
                </span>
                <div className="mt-3">
                  <AuthCard accountType="shop" defaultTab="register" />
                </div>
                <p className="mt-4 text-center text-xs text-muted">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                    Sign in
                  </Link>
                </p>
              </MotionReveal>

              <MotionReveal delay={180}>
                <div id="sample-passport">
                  <SectionHeading
                    align="left"
                    eyebrow={messagingDemo.home.sampleEyebrow}
                    title={messagingDemo.home.sampleTitle}
                    subtitle="What buyers receive when you issue a passport at handover."
                  />
                  <div className="mt-4">
                    <SamplePetPassport compact />
                  </div>
                </div>
              </MotionReveal>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
