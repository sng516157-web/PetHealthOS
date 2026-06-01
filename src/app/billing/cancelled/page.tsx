import Link from "next/link";
import { XCircle } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";

export default async function BillingCancelledPage() {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <XCircle size={30} />
      </div>
      <h1 className="mt-4 text-xl font-semibold text-foreground">
        {t.billing.cancelledTitle}
      </h1>
      <p className="mt-1 max-w-sm text-sm text-muted">{t.billing.cancelledDesc}</p>
      <Link
        href="/pricing"
        className="mt-5 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-brand-300"
      >
        {t.billing.viewPlans}
      </Link>
    </div>
  );
}
