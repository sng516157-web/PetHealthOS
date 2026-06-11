import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { resolveStripeCustomerId } from "@/lib/billing";
import { getUserUsage } from "@/lib/data";
import { ManageSubscription } from "@/components/ManageSubscription";
import { getI18n } from "@/lib/i18n/server";

export default async function OwnerAccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const [{ t }, usage, stripeCustomerId] = await Promise.all([
    getI18n(),
    getUserUsage(user.id),
    resolveStripeCustomerId({ kind: "user", id: user.id }),
  ]);
  if (!usage) redirect("/login");

  const planName =
    (t.plans as Record<string, string>)[usage.plan.key] ?? usage.plan.key;

  return (
    <div className="space-y-6">
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
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {t.account.typeOwner}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t.account.displayName}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted">
              {t.account.currentPlan}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">{planName}</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">
          {t.account.subscriptionTitle}
        </h2>
        <div className="mt-3">
          <ManageSubscription
            scope="user"
            canManage={Boolean(stripeCustomerId)}
          />
        </div>
      </div>

      <Link
        href="/me/billing"
        className="flex items-center justify-between rounded-2xl border border-border bg-surface px-5 py-4 text-sm font-medium text-foreground transition hover:border-brand-300"
      >
        {t.account.billingLink}
        <ChevronRight size={16} className="text-muted" />
      </Link>
    </div>
  );
}
