import Link from "next/link";
import { Check, Star } from "lucide-react";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { ORG_PLANS, USER_PLANS, type Plan } from "@/lib/plans";
import { LocaleToggle } from "@/components/LocaleToggle";
import { getI18n } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/en";

export default async function PricingPage() {
  const { t } = await getI18n();

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface/95">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <PawSureMarkTile className="h-9 w-9" />
            <span className="flex items-baseline gap-1.5">
              <span className="text-sm font-extrabold text-forest">PawSure</span>
              <span className="font-cn text-xs font-bold text-forest/70">宠诺</span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LocaleToggle compact />
            <Link
              href="/login"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
            >
              {t.auth.signIn}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 md:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t.pricing.title}
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            {t.pricing.subtitle}
          </p>
        </div>

        <section className="mt-10">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            {t.pricing.forShops}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(ORG_PLANS).map((p) => (
              <PlanCard
                key={p.key}
                plan={p}
                t={t}
                cta={{ href: "/app/billing", label: p.priceRmb > 0 ? t.pricing.choose : t.pricing.getStarted }}
                highlight={p.key === "SHOP"}
              />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted">
            {t.pricing.forOwners}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.values(USER_PLANS).map((p) => (
              <PlanCard
                key={p.key}
                plan={p}
                t={t}
                cta={{ href: "/me/billing", label: p.priceRmb > 0 ? t.pricing.choose : t.pricing.getStarted }}
                highlight={p.key === "PLUS"}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function PlanCard({
  plan,
  t,
  cta,
  highlight,
}: {
  plan: Plan;
  t: Dictionary;
  cta: { href: string; label: string };
  highlight?: boolean;
}) {
  const name = (t.plans as Record<string, string>)[plan.key] ?? plan.key;
  const tagline =
    plan.key === "STARTER"
      ? t.pricing.starterTagline
      : plan.key === "SHOP"
        ? t.pricing.shopTagline
        : plan.key === "FREE"
          ? t.pricing.freeTagline
          : t.pricing.plusTagline;

  return (
    <div
      className={`relative rounded-2xl border p-6 ${
        highlight ? "border-brand-400 bg-brand-50/40 shadow-sm" : "border-border bg-surface"
      }`}
    >
      {highlight && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-medium text-white">
          <Star size={11} /> {t.pricing.mostPopular}
        </span>
      )}
      <h3 className="text-base font-semibold text-foreground">{name}</h3>
      <p className="mt-0.5 text-xs text-muted">{tagline}</p>
      <div className="mt-3 text-3xl font-bold text-foreground">
        {plan.priceRmb > 0 ? t.pricing.rmb(plan.priceRmb) : t.pricing.free}
        {plan.priceRmb > 0 && (
          <span className="text-sm font-normal text-muted">{t.pricing.perMonth}</span>
        )}
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <Check size={15} className="text-emerald-500" />
          {t.pricing.includedPets(plan.includedPets)}
        </li>
        {plan.extraPetPriceRmb > 0 && (
          <li className="flex items-center gap-2">
            <Check size={15} className="text-emerald-500" />
            {t.pricing.extraPet(plan.extraPetPriceRmb)}
          </li>
        )}
        <li className="flex items-center gap-2">
          <Check size={15} className="text-emerald-500" />
          {t.pricing.aiAssistant}
        </li>
        {plan.canIssuePassport ? (
          <li className="flex items-center gap-2">
            <Check size={15} className="text-emerald-500" />
            {t.pricing.issuePassports}
          </li>
        ) : (
          <li className="flex items-center gap-2 text-muted">
            <Check size={15} className="text-slate-300" />
            {t.pricing.notForSale}
          </li>
        )}
        {plan.multiSeat && (
          <li className="flex items-center gap-2">
            <Check size={15} className="text-emerald-500" />
            {t.pricing.multiSeat}
          </li>
        )}
      </ul>
      <Link
        href={cta.href}
        className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
          highlight
            ? "bg-brand-600 text-white hover:bg-brand-700"
            : "border border-border text-slate-700 hover:border-brand-300"
        }`}
      >
        {cta.label}
      </Link>
    </div>
  );
}
