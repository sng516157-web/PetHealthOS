import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check, Hospital } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import {
  FACILITY_EXTRA_SLOT_PRICE_USD,
  SHOP_BILLING,
} from "@/lib/plans";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import { AuthCard } from "@/components/AuthCard";
import {
  AuroraOrbs,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "@/components/motion/aurora";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Veterinary & Boarding Pet Care Records",
  description:
    "Hospitals and boarding facilities scan an owner QR to access time-boxed pet health history during care — no passport issuance, owner-controlled access.",
  path: "/facility",
});

export default async function FacilityLandingPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");
  const { locale, t } = await getI18n();
  const f = t.landing.facility;

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

              <MotionReveal delay={80}>
                <div
                  className={`mt-8 rounded-3xl border border-border bg-surface p-6 shadow-soft ${motionCardHover}`}
                >
                  <h2 className="text-sm font-bold text-forest">{f.whatTitle}</h2>
                  <ul className="mt-4 space-y-3">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-sm text-ink/75">
                        <Check size={16} className="mt-0.5 shrink-0 text-sage" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
                    {f.pricingLine(
                      SHOP_BILLING.month,
                      SHOP_BILLING.year,
                      FACILITY_EXTRA_SLOT_PRICE_USD,
                    )}
                  </p>
                </div>
              </MotionReveal>
            </div>

            <MotionReveal delay={120}>
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
                  {f.loginTitle}
                </span>
                <div className="mt-3">
                  <AuthCard accountType="facility" defaultTab="register" />
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
