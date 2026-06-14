import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, Info, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import { OwnerStartPanel } from "@/components/OwnerStartPanel";
import {
  AuroraOrbs,
  MotionFloat,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pet Owner Health Records & Passport Claims",
  description:
    "Free pet health tracker for owners: log vaccines and weights, AI-assisted triage, reminders, and claim a digital passport from your breeder or shop.",
  path: "/owner",
});

export default async function OwnerLandingPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");
  const { locale, t } = await getI18n();
  const o = t.landing.owner;

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} locale={locale} />

      <main className="relative overflow-hidden">
        <AuroraOrbs className="-z-10" />
        <div className="relative mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
          <MotionPop index={0}>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest"
            >
              <ArrowLeft size={14} /> {t.landing.backHome}
            </Link>
          </MotionPop>

          <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
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

              <MotionReveal delay={80}>
                <div
                  className={`mt-8 rounded-3xl border border-border bg-surface p-6 shadow-soft ${motionCardHover}`}
                >
                  <h2 className="text-sm font-bold text-forest">{o.whatTitle}</h2>
                  <ul className="mt-4 space-y-3">
                    {o.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-ink/75">
                        <Check size={16} className="mt-0.5 shrink-0 text-sage" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </MotionReveal>

              <MotionReveal delay={160}>
                <p className="mt-5 flex items-start gap-2 rounded-2xl bg-[#F4C96B]/15 px-4 py-3 text-xs leading-relaxed text-ink/70">
                  <Info size={15} className="mt-0.5 shrink-0 text-[#b88a2a]" />
                  {o.note}
                </p>
              </MotionReveal>

              <MotionReveal delay={240}>
                <div className="mt-6">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                    {t.landing.seeItTitle}
                  </p>
                  <MotionFloat>
                    <div className="overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-soft">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/demos/owner.gif"
                        alt={t.landing.demoOwnerAlt}
                        className="block w-full rounded-xl"
                      />
                    </div>
                  </MotionFloat>
                </div>
              </MotionReveal>
            </div>

            <MotionReveal delay={120}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                  {o.startEyebrow}
                </span>
                <div className="mt-3">
                  <OwnerStartPanel />
                </div>
                <p className="mt-4 text-center text-xs text-muted">
                  {t.landing.alreadyMember}{" "}
                  <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                    {t.landing.nav.signIn}
                  </Link>
                </p>
              </div>
            </MotionReveal>
          </div>
        </div>
      </main>

      <LandingFooter t={t} locale={locale} />
    </div>
  );
}
