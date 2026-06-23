import {
  getOrgUsage,
  isFacilityOrg,
  getFacilityCapacity,
} from "@/lib/data";
import {
  SHOP_BILLING,
  FACILITY_EXTRA_SLOT_PRICE_USD,
} from "@/lib/plans";
import { Check } from "lucide-react";
import { ShopBilling } from "@/components/ShopBilling";
import { FacilitySlots } from "@/components/FacilitySlots";
import { FoundingBreederLifetimeCard } from "@/components/FoundingBreederLifetimeCard";
import { getFoundingBreederLifetimeAvailability } from "@/lib/founding-breeder-lifetime";
import { isFoundingBreederLifetimePlan } from "@/lib/founding-breeder-lifetime";
import { getI18n } from "@/lib/i18n/server";

export default async function OrgBillingPage() {
  const { t } = await getI18n();
  const { org, plan, count, limit } = await getOrgUsage();
  const facility = isFacilityOrg(org);
  const capacity = facility ? await getFacilityCapacity() : null;
  const founding = !facility ? await getFoundingBreederLifetimeAvailability() : null;
  const isLifetime = isFoundingBreederLifetimePlan(plan.key);
  const isShop = plan.key === "SHOP";
  const pct = Math.min(100, Math.round((count / Math.max(1, limit)) * 100));
  const atLimit = count >= limit;

  return (
    <div className="space-y-6 px-5 py-8 md:px-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{t.billing.title}</h2>
        <p className="mt-1 text-sm text-muted">{t.billing.subtitle}</p>
      </div>

      {!facility && (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
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
      )}

      {facility && capacity && (
        <>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-foreground">
              {t.facility.planBenefitsTitle}
            </h3>
            <ul className="mt-3 space-y-2">
              {t.facility
                .planBenefits(capacity.base, FACILITY_EXTRA_SLOT_PRICE_USD)
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
            price={FACILITY_EXTRA_SLOT_PRICE_USD}
            inCare={capacity.inCare}
            limit={capacity.limit}
            extraSlots={capacity.extra}
          />
        </>
      )}

      {!facility && founding && !isShop && (
        <FoundingBreederLifetimeCard
          mode="checkout"
          soldOut={founding.soldOut}
          remaining={founding.remaining}
          active={isLifetime}
        />
      )}

      {!facility && !isLifetime && (
        <ShopBilling
          currentPlan={plan.key}
          currentInterval={org.planInterval}
          priceMonth={SHOP_BILLING.month}
          priceYear={SHOP_BILLING.year}
          title={facility ? t.facility.planTitle : undefined}
          subtitle={facility ? t.facility.planSubtitle : undefined}
        />
      )}
    </div>
  );
}
