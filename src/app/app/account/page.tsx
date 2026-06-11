import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getStripeCustomerId } from "@/lib/billing";
import { requireActiveOrg, isFacilityOrg } from "@/lib/data";
import { ManageSubscription } from "@/components/ManageSubscription";
import { getI18n } from "@/lib/i18n/server";

export default async function OrgAccountPage() {
  const org = await requireActiveOrg();
  const [{ t }, stripeCustomerId] = await Promise.all([
    getI18n(),
    getStripeCustomerId({ kind: "org", id: org.id }),
  ]);
  const facility = isFacilityOrg(org);
  const planName = (t.plans as Record<string, string>)[org.plan] ?? org.plan;
  const accountType = facility ? t.account.typeFacility : t.account.typeShop;

  const intervalLabel =
    org.planInterval === "month"
      ? t.shopBilling.monthly
      : org.planInterval === "year"
        ? t.shopBilling.yearly
        : null;

  return (
    <div className="space-y-6 px-5 py-8 md:px-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.account.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.account.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <dl className="space-y-4">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t.account.accountType}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">{accountType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t.account.displayName}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">{org.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t.account.currentPlan}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {planName}
              {intervalLabel && (
                <span className="ml-1.5 text-xs font-normal text-muted">
                  ({intervalLabel})
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">
          {t.account.subscriptionTitle}
        </h2>
        <div className="mt-3">
          <ManageSubscription
            scope="org"
            canManage={Boolean(stripeCustomerId)}
          />
        </div>
      </div>

      <Link
        href="/app/billing"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 text-sm font-medium text-foreground transition hover:border-brand-300"
      >
        {t.account.billingLink}
        <ChevronRight size={16} className="text-muted" />
      </Link>
    </div>
  );
}
