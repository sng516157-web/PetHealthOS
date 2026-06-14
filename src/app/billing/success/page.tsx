import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { finalizeStripeSession } from "@/lib/billing";
import { getI18n } from "@/lib/i18n/server";
import { BillingSuccessTracker } from "@/components/BillingSuccessTracker";

export const dynamic = "force-dynamic";

export default async function BillingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const { t } = await getI18n();

  let backHref = "/";
  let state: "success" | "pending" | "failed" | "missing" = "missing";
  let scopeKind: string | undefined;

  if (session_id) {
    const res = await finalizeStripeSession(session_id);
    scopeKind = res.scopeKind;
    backHref =
      res.scopeKind === "user" || res.scopeKind === "user_slot"
        ? "/me/billing"
        : "/app/billing";

    if (res.ok) {
      state = "success";
    } else if (res.error === "NOT_READY") {
      state = "pending";
    } else {
      state = "failed";
    }
  }

  const icon =
    state === "success" ? (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500">
        <CheckCircle2 size={30} />
      </div>
    ) : state === "pending" ? (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
        <Clock size={30} />
      </div>
    ) : (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
        <AlertCircle size={30} />
      </div>
    );

  const title =
    state === "success"
      ? t.billing.successTitle
      : state === "pending"
        ? t.billing.successPendingTitle
        : state === "failed"
          ? t.billing.successFailedTitle
          : t.billing.successFailedTitle;

  const desc =
    state === "success"
      ? t.billing.successDesc
      : state === "pending"
        ? t.billing.successPendingDesc
        : state === "failed"
          ? t.billing.successFailedDesc
          : t.billing.successMissingDesc;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
      <BillingSuccessTracker
        state={state}
        scopeKind={scopeKind}
        sessionId={session_id}
      />
      {icon}
      <h1 className="mt-4 text-xl font-semibold text-foreground">{title}</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">{desc}</p>
      <Link
        href={backHref}
        className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {t.billing.backToBilling}
      </Link>
      {state === "pending" && session_id && (
        <Link
          href={`/billing/success?session_id=${session_id}`}
          className="mt-3 text-sm font-medium text-brand-700 hover:underline"
        >
          {t.billing.successRetry}
        </Link>
      )}
    </div>
  );
}
