"use client";

import { useState, useTransition } from "react";
import { CreditCard } from "lucide-react";
import { openBillingPortal } from "@/app/actions";
import { useI18n } from "@/lib/i18n/client";

export function ManageSubscription({
  scope,
  canManage,
}: {
  scope: "user" | "org";
  canManage: boolean;
}) {
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!canManage) {
    return (
      <p className="text-sm text-muted">{t.account.subscriptionNone}</p>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-600">{t.account.subscriptionManageDesc}</p>
      {error && (
        <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await openBillingPortal(scope);
            if (res?.url) {
              window.location.href = res.url;
              return;
            }
            if (res?.error === "PORTAL_NOT_AVAILABLE") {
              setError(t.account.portalUnavailable);
              return;
            }
            if (res?.error === "STRIPE_NOT_CONFIGURED") {
              setError(t.billing.providerComingSoon);
              return;
            }
            setError(t.account.portalError);
          });
        }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        <CreditCard size={14} />
        {pending ? "…" : t.account.manageSubscription}
      </button>
    </div>
  );
}
