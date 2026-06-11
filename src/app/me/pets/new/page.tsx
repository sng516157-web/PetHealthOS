import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, PawPrint, ArrowRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getUserUsage } from "@/lib/data";
import { OwnedPetForm } from "@/components/OwnedPetForm";
import { getI18n } from "@/lib/i18n/server";

export default async function NewOwnedPetPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { t } = await getI18n();

  // Gentle hard block: free owners are capped at their included pets. Rather
  // than letting them fill the form only to be rejected on submit, show a warm
  // upgrade prompt up front. (Inherited pets via passport scan aren't blocked.)
  const usage = await getUserUsage(user.id);
  const atLimit = usage ? usage.count >= usage.limit : false;

  return (
    <div className="space-y-6">
      <Link
        href="/me"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand-600"
      >
        <ChevronLeft size={15} /> {t.me.backToPets}
      </Link>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.me.addPetTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.me.addPetSubtitle}</p>
      </div>

      {atLimit ? (
        <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
            <PawPrint size={22} />
          </span>
          <h2 className="mt-3 text-base font-semibold text-forest">
            {t.me.limitTitle(usage?.limit ?? 1)}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink/70">
            {t.me.limitDesc(usage?.plan.extraPetPriceUsd ?? 2.99)}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/me/billing"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              {t.me.limitUpgrade} <ArrowRight size={15} />
            </Link>
            <Link
              href="/me"
              className="inline-flex items-center rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-brand-300"
            >
              {t.me.backToPets}
            </Link>
          </div>
        </div>
      ) : (
        <OwnedPetForm />
      )}
    </div>
  );
}
