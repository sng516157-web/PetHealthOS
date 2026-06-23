/** Org plan key stored in `Organization.plan`. */
export const FOUNDING_BREEDER_LIFETIME_PLAN_KEY = "FOUNDING_BREEDER_LIFETIME";

export const FOUNDING_BREEDER_LIFETIME_PRICE_USD = 299;

export function foundingBreederLifetimeStripePriceId(): string | null {
  const id = process.env.STRIPE_FOUNDING_BREEDER_LIFETIME_PRICE_ID?.trim();
  return id || null;
}

export function foundingBreederLifetimeLimit(): number {
  const raw = process.env.FOUNDING_BREEDER_LIFETIME_LIMIT?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 25;
  return Number.isFinite(n) && n > 0 ? n : 25;
}

export function isFoundingBreederLifetimePlan(
  planKey: string | null | undefined,
): boolean {
  return planKey === FOUNDING_BREEDER_LIFETIME_PLAN_KEY;
}

/** Paid breeder workspace (subscription or lifetime). */
export function isPaidBreederOrgPlan(planKey: string | null | undefined): boolean {
  return planKey === "SHOP" || isFoundingBreederLifetimePlan(planKey);
}
