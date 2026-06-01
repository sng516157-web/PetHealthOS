import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getUserUsage } from "@/lib/data";
import { USER_PLANS, type Plan } from "@/lib/plans";
import { UpgradePanel, type PlanOption } from "@/components/UpgradePanel";
import { getI18n } from "@/lib/i18n/server";

function toOption(p: Plan): PlanOption {
  return {
    key: p.key,
    priceRmb: p.priceRmb,
    includedPets: p.includedPets,
    extraPetPriceRmb: p.extraPetPriceRmb,
    issuePassports: p.canIssuePassport,
    multiSeat: p.multiSeat,
  };
}

export default async function UserBillingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { t } = await getI18n();
  const usage = await getUserUsage(user.id);
  if (!usage) redirect("/login");

  const { plan, count, limit } = usage;
  const planName = (t.plans as Record<string, string>)[plan.key] ?? plan.key;
  const pct = Math.min(100, Math.round((count / Math.max(1, limit)) * 100));
  const atLimit = count >= limit;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.billing.title}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.billing.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted">{t.billing.currentPlan}</span>
          <span className="text-sm font-semibold text-foreground">{planName}</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${atLimit ? "bg-amber-500" : "bg-brand-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">{t.billing.usage(count, limit)}</p>
        {atLimit && (
          <p className="mt-1 text-xs font-medium text-amber-700">{t.billing.atLimit}</p>
        )}
      </div>

      <UpgradePanel
        scope="user"
        currentPlan={plan.key}
        plans={Object.values(USER_PLANS).map(toOption)}
      />
    </div>
  );
}
