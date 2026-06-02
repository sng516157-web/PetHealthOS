// Pricing tiers + quota math. Prices are placeholders, easy to adjust.
// Quota enforcement is HARD: you cannot add a pet beyond your effective limit
// (plan's included pets + any purchased extra slots).

export type Audience = "org" | "user";

export type Plan = {
  key: string;
  audience: Audience;
  // Pets included in the base plan.
  includedPets: number;
  // Monthly base price in RMB (fen handled at checkout). 0 = free.
  priceRmb: number;
  // Per-extra-pet add-on price per month (RMB). 0 = no overage option.
  extraPetPriceRmb: number;
  canIssuePassport: boolean;
  multiSeat: boolean;
};

export const ORG_PLANS: Record<string, Plan> = {
  STARTER: {
    key: "STARTER",
    audience: "org",
    includedPets: 5,
    priceRmb: 0,
    extraPetPriceRmb: 0,
    canIssuePassport: true,
    multiSeat: false,
  },
  SHOP: {
    key: "SHOP",
    audience: "org",
    includedPets: 50,
    priceRmb: 2000,
    extraPetPriceRmb: 30,
    canIssuePassport: true,
    multiSeat: true,
  },
};

export const USER_PLANS: Record<string, Plan> = {
  // The "Owner's Account": the free account created when a pet is transferred
  // to a new owner, or when an existing pet owner signs up directly. Free,
  // capped at 2 pets, and cannot issue health passports.
  FREE: {
    key: "FREE",
    audience: "user",
    includedPets: 2,
    priceRmb: 0,
    extraPetPriceRmb: 0,
    canIssuePassport: false,
    multiSeat: false,
  },
  PLUS: {
    key: "PLUS",
    audience: "user",
    includedPets: 25,
    priceRmb: 25,
    extraPetPriceRmb: 0,
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

// Effective pet limit = plan's included pets + purchased extra slots.
export function petLimit(plan: Plan, extraPetSlots: number): number {
  return plan.includedPets + Math.max(0, extraPetSlots);
}

export function canAddPet(
  plan: Plan,
  extraPetSlots: number,
  currentCount: number,
): boolean {
  return currentCount < petLimit(plan, extraPetSlots);
}
