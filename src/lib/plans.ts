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
  // Absolute ceiling on total pets (included + purchased), regardless of how
  // many extra slots are bought. null = no hard cap.
  petCap: number | null;
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
    petCap: null,
    canIssuePassport: true,
    multiSeat: false,
  },
  SHOP: {
    key: "SHOP",
    audience: "org",
    includedPets: 50,
    priceRmb: 2000,
    extraPetPriceRmb: 30,
    petCap: null,
    canIssuePassport: true,
    multiSeat: true,
  },
};

// Owners have a single tier — the "Owner's Account": free, created on
// passport-claim or self-signup. 2 pets included; beyond that, ¥25/mo per
// extra pet, hard-capped at 10 pets total. Cannot issue passports. (An owner
// who needs more than 10 / wants passports should use a Shop account.)
export const OWNER_EXTRA_PET_CAP = 10;

export const USER_PLANS: Record<string, Plan> = {
  FREE: {
    key: "FREE",
    audience: "user",
    includedPets: 2,
    priceRmb: 0,
    extraPetPriceRmb: 25,
    petCap: OWNER_EXTRA_PET_CAP,
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

// Effective pet limit = plan's included pets + purchased extra slots, clamped
// to the plan's hard cap (if any).
export function petLimit(plan: Plan, extraPetSlots: number): number {
  const raw = plan.includedPets + Math.max(0, extraPetSlots);
  return plan.petCap != null ? Math.min(raw, plan.petCap) : raw;
}

// Max number of extra pet slots a plan allows buying (0 if no overage / capped
// out at the included count). Used to gate "add a pet slot" purchases.
export function maxExtraSlots(plan: Plan): number {
  if (plan.extraPetPriceRmb <= 0) return 0;
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
