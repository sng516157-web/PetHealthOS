import { getOrgUsage, getOrgReferral } from "@/lib/data";
import {
  SHOP_BILLING,
  yearlyPriceRmb,
  referralDiscountRate,
} from "@/lib/plans";
import { ShopBilling } from "@/components/ShopBilling";
import { getI18n } from "@/lib/i18n/server";

export default async function OrgBillingPage() {
  const { t } = await getI18n();
  const { org, plan, count, limit } = await getOrgUsage();
  const { code, referralCount } = await getOrgReferral();
  const planName = (t.plans as Record<string, string>)[plan.key] ?? plan.key;
  const pct = Math.min(100, Math.round((count / Math.max(1, limit)) * 100));
  const atLimit = count >= limit;
  const discountPct = Math.round(referralDiscountRate(referralCount) * 100);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t.billing.title}</h2>
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

      <ShopBilling
        currentPlan={plan.key}
        currentInterval={org.planInterval}
        priceMonth={SHOP_BILLING.month}
        priceYearFull={SHOP_BILLING.year}
        priceYear={yearlyPriceRmb(referralCount)}
        priceLifetime={SHOP_BILLING.lifetime}
        discountPct={discountPct}
        referralCode={code}
        referralCount={referralCount}
      />
    </div>
  );
}
