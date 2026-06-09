import {
  getOrgUsage,
  getOrgReferral,
  isFacilityOrg,
  getFacilityCapacity,
} from "@/lib/data";
import {
  SHOP_BILLING,
  yearlyPriceRmb,
  referralDiscountRate,
  FACILITY_EXTRA_SLOT_PRICE_RMB,
} from "@/lib/plans";
import { Check } from "lucide-react";
import { ShopBilling } from "@/components/ShopBilling";
import { FacilitySlots } from "@/components/FacilitySlots";
import { getI18n } from "@/lib/i18n/server";

export default async function OrgBillingPage() {
  const { t } = await getI18n();
  const { org, plan, count, limit } = await getOrgUsage();
  const { code, referralCount } = await getOrgReferral();
  const planName = (t.plans as Record<string, string>)[plan.key] ?? plan.key;
  const discountPct = Math.round(referralDiscountRate(referralCount) * 100);
  const facility = isFacilityOrg(org);
  // Facilities don't own pets — show care-slot capacity instead of a pet quota.
  const capacity = facility ? await getFacilityCapacity() : null;
  const pct = Math.min(100, Math.round((count / Math.max(1, limit)) * 100));
  const atLimit = count >= limit;

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
        {!facility && (
          <>
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
          </>
        )}
      </div>

      {facility && capacity && (
        <>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-foreground">
              {t.facility.planBenefitsTitle}
            </h3>
            <ul className="mt-3 space-y-2">
              {t.facility
                .planBenefits(capacity.base, FACILITY_EXTRA_SLOT_PRICE_RMB)
                .map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    {b}
                  </li>
                ))}
            </ul>
          </div>
          <FacilitySlots
            base={capacity.base}
            price={FACILITY_EXTRA_SLOT_PRICE_RMB}
            inCare={capacity.inCare}
            limit={capacity.limit}
          />
        </>
      )}

      <ShopBilling
        currentPlan={plan.key}
        currentInterval={org.planInterval}
        priceMonth={SHOP_BILLING.month}
        priceYearFull={SHOP_BILLING.year}
        priceYear={yearlyPriceRmb(referralCount)}
        discountPct={discountPct}
        referralCode={code}
        referralCount={referralCount}
        title={facility ? t.facility.planTitle : undefined}
        subtitle={facility ? t.facility.planSubtitle : undefined}
      />
    </div>
  );
}
