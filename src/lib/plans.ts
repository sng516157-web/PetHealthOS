export type Plan = {
  key: string;
  audience: "org" | "user";
  includedPets: number;
  /** Monthly base price in USD. 0 = free. */
  priceUsd: number;
  /** Per-extra-pet add-on price per month (USD). */
  extraPetPriceUsd: number;
  petCap: number | null;
  canIssuePassport: boolean;
  multiSeat: boolean;
};

export const ORG_PLANS: Record<string, Plan> = {
  STARTER: {
    key: "STARTER",
    audience: "org",
    includedPets: 5,
    priceUsd: 0,
    extraPetPriceUsd: 0,
    petCap: null,
    canIssuePassport: true,
    multiSeat: false,
  },
  SHOP: {
    key: "SHOP",
    audience: "org",
    includedPets: 50,
    priceUsd: 14.99,
    extraPetPriceUsd: 2.49,
    petCap: null,
    canIssuePassport: true,
    multiSeat: true,
  },
};

export type BillingInterval = "month" | "year";

/** Paid SHOP plan — monthly or yearly (USD). */
export const SHOP_BILLING: Record<BillingInterval, number> = {
  month: 14.99,
  year: 149,
};

export function isBillingInterval(v: string | null | undefined): v is BillingInterval {
  return v === "month" || v === "year";
}

export function shopPriceUsd(interval: BillingInterval): number {
  return SHOP_BILLING[interval];
}

export const FACILITY_BASE_CAPACITY = 50;
export const FACILITY_EXTRA_SLOT_PRICE_USD = 2.49;

export function facilityCapacity(extraSlots: number): number {
  return FACILITY_BASE_CAPACITY + Math.max(0, extraSlots);
}

/** Paid owner plan — monthly or yearly (USD). Includes 5 pets; no per-pet add-ons. */
export const OWNER_BILLING: Record<BillingInterval, number> = {
  month: 6.99,
  year: 80,
};

export function ownerPriceUsd(interval: BillingInterval): number {
  return OWNER_BILLING[interval];
}

export const USER_PLANS: Record<string, Plan> = {
  FREE: {
    key: "FREE",
    audience: "user",
    includedPets: 1,
    priceUsd: 0,
    extraPetPriceUsd: 0,
    petCap: 1,
    canIssuePassport: false,
    multiSeat: false,
  },
  PLUS: {
    key: "PLUS",
    audience: "user",
    includedPets: 5,
    priceUsd: 6.99,
    extraPetPriceUsd: 0,
    petCap: 5,
    canIssuePassport: false,
    multiSeat: false,
  },
};

export function getOrgPlan(key: string | null | undefined): Plan {
  return ORG_PLANS[key ?? "STARTER"] ?? ORG_PLANS.STARTER;
}

export function getUserPlan(key: string | null | undefined): Plan {
  return USER_PLANS[key ?? "FREE"] ?? USER_PLANS.FREE;
}

export function petLimit(plan: Plan, extraPetSlots: number): number {
  const raw = plan.includedPets + Math.max(0, extraPetSlots);
  return plan.petCap != null ? Math.min(raw, plan.petCap) : raw;
}

export function maxExtraSlots(plan: Plan): number {
  if (plan.extraPetPriceUsd <= 0) return 0;
  if (plan.petCap == null) return Infinity;
  return Math.max(0, plan.petCap - plan.includedPets);
}

export function canAddPet(
  plan: Plan,
  extraPetSlots: number,
  currentCount: number,
): boolean {
  return currentCount < petLimit(plan, extraPetSlots);
}