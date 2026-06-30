/** Org plan keys stored in `Organization.plan`. */
export const FOUNDING_BREEDER_EARLY_PLAN_KEY = "FOUNDING_BREEDER_EARLY";
export const FOUNDING_BREEDER_LIFETIME_PLAN_KEY = "FOUNDING_BREEDER_LIFETIME";

export const FOUNDING_BREEDER_EARLY_PRICE_USD = 99;
export const FOUNDING_BREEDER_LIFETIME_PRICE_USD = 299;

export type FoundingBreederTier = "early" | "lifetime";

export function foundingBreederEarlyStripePriceId(): string | null {
  const id = process.env.STRIPE_FOUNDING_BREEDER_EARLY_PRICE_ID?.trim();
  return id || null;
}

export function foundingBreederLifetimeStripePriceId(): string | null {
  const id = process.env.STRIPE_FOUNDING_BREEDER_LIFETIME_PRICE_ID?.trim();
  return id || null;
}

export function foundingBreederEarlyLimit(): number {
  const raw = process.env.FOUNDING_BREEDER_EARLY_LIMIT?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 25;
  return Number.isFinite(n) && n > 0 ? n : 25;
}

/** Legacy env — kept for ops reference; $299 tier is not spot-capped in product UI. */
export function foundingBreederLifetimeLimit(): number {
  const raw = process.env.FOUNDING_BREEDER_LIFETIME_LIMIT?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 25;
  return Number.isFinite(n) && n > 0 ? n : 25;
}

export function isFoundingBreederEarlyPlan(planKey: string | null | undefined): boolean {
  return planKey === FOUNDING_BREEDER_EARLY_PLAN_KEY;
}

export function isFoundingBreederLifetimePlan(planKey: string | null | undefined): boolean {
  return planKey === FOUNDING_BREEDER_LIFETIME_PLAN_KEY;
}

/** Either paid lifetime founding tier (early or standard). */
export function isFoundingBreederPaidLifetimePlan(
  planKey: string | null | undefined,
): boolean {
  return isFoundingBreederEarlyPlan(planKey) || isFoundingBreederLifetimePlan(planKey);
}

/** Paid breeder workspace (subscription or lifetime). */
export function isPaidBreederOrgPlan(planKey: string | null | undefined): boolean {
  return planKey === "SHOP" || isFoundingBreederPaidLifetimePlan(planKey);
}

export function foundingBreederPlanKey(tier: FoundingBreederTier): string {
  return tier === "early"
    ? FOUNDING_BREEDER_EARLY_PLAN_KEY
    : FOUNDING_BREEDER_LIFETIME_PLAN_KEY;
}

export function foundingBreederPriceUsd(tier: FoundingBreederTier): number {
  return tier === "early"
    ? FOUNDING_BREEDER_EARLY_PRICE_USD
    : FOUNDING_BREEDER_LIFETIME_PRICE_USD;
}
