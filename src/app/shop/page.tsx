import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Store } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";
import { AuthCard } from "@/components/AuthCard";

export default async function ShopLandingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");
  const { t } = await getI18n();
  const sh = t.landing.shop;
  const { ref } = await searchParams;
  const referralCode = ref?.trim() || undefined;

  const rows = [sh.diffPets, sh.diffPassport, sh.diffLineage, sh.diffPrice];

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} />

      <main className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest">
          <ArrowLeft size={14} /> {t.landing.backHome}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* Explanation */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
              <Store size={13} /> {sh.eyebrow}
            </span>
            <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-forest md:text-4xl">
              {sh.title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-ink/70">{sh.subtitle}</p>

            <div className="mt-8 rounded-3xl border border-border bg-surface p-6 shadow-soft">
              <h2 className="text-sm font-bold text-forest">{sh.whatTitle}</h2>
              <ul className="mt-4 space-y-3">
                {sh.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-ink/75">
                    <Check size={16} className="mt-0.5 shrink-0 text-sage" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* Comparison */}
            <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-surface shadow-soft">
              <div className="grid grid-cols-3 bg-forest/5 px-4 py-3 text-xs font-semibold text-forest">
                <span>{sh.differenceTitle}</span>
                <span className="text-center">{sh.ownerCol}</span>
                <span className="text-center">{sh.shopCol}</span>
              </div>
              {rows.map((r, i) => (
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

            <Link
              href="/pricing"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline"
            >
              {sh.seePricing} <ArrowRight size={15} />
            </Link>
          </div>

          {/* Auth */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">
              {sh.loginTitle}
            </span>
            <div className="mt-3">
              <AuthCard
                accountType="shop"
                defaultTab="register"
                referralCode={referralCode}
              />
            </div>
            <p className="mt-4 text-center text-xs text-muted">
              {t.landing.alreadyMember}{" "}
              <Link href="/login" className="font-semibold text-brand-700 hover:underline">
                {t.landing.nav.signIn}
              </Link>
            </p>
          </div>
        </div>
      </main>

      <LandingFooter t={t} />
    </div>
  );
}
