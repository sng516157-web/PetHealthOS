import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { finalizeStripeSession } from "@/lib/billing";
import { getI18n } from "@/lib/i18n/server";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const { t } = await getI18n();

  let backHref = "/";
  if (session_id) {
    const res = await finalizeStripeSession(session_id);
    backHref = res.scopeKind === "user" ? "/me/billing" : "/billing";
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
        <CheckCircle2 size={30} />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        {t.billing.successTitle}
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted">{t.billing.successDesc}</p>
      <Link
        href={backHref}
        className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {t.billing.backToBilling}
      </Link>
    </div>
  );
}
