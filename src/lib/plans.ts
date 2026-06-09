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
    // Monthly "from" price (the SHOP plan is sold monthly or yearly — see
    // SHOP_BILLING). Kept for display fallbacks.
    priceRmb: 599,
    extraPetPriceRmb: 30,
    petCap: null,
    canIssuePassport: true,
    multiSeat: true,
  },
};

// The paid SHOP plan is sold two ways: pay monthly, or pay yearly (cheaper than
// 12× monthly). Prices in RMB.
export type BillingInterval = "month" | "year";

export const SHOP_BILLING: Record<BillingInterval, number> = {
  month: 599,
  year: 4888,
};

export function isBillingInterval(v: string | null | undefined): v is BillingInterval {
  return v === "month" || v === "year";
}

// Referral programme: for each other shop that registers through a shop's link,
// that shop earns 5% off its YEARLY payment, stacking up to a 50% cap (i.e. 10
// referrals). The discount applies to the yearly option only — not monthly.
export const REFERRAL_DISCOUNT_STEP = 0.05;
export const REFERRAL_DISCOUNT_MAX = 0.5;

export function referralDiscountRate(referralCount: number): number {
  return Math.min(REFERRAL_DISCOUNT_MAX, REFERRAL_DISCOUNT_STEP * Math.max(0, referralCount));
}

// Yearly price after applying a shop's referral discount (rounded to whole RMB).
export function yearlyPriceRmb(referralCount: number): number {
  return Math.round(SHOP_BILLING.year * (1 - referralDiscountRate(referralCount)));
}

export function shopPriceRmb(interval: BillingInterval, referralCount = 0): number {
  if (interval === "year") return yearlyPriceRmb(referralCount);
  return SHOP_BILLING.month;
}

// Facilities (hospital/boarding) care for pets that come and go. They can hold
// up to FACILITY_BASE_CAPACITY pets in care at once; beyond that, each extra
// "care slot" is ¥15/mo and stays as long as it's paid for, even when empty.
export const FACILITY_BASE_CAPACITY = 20;
export const FACILITY_EXTRA_SLOT_PRICE_RMB = 15;

// Max concurrent pets-in-care = base + purchased extra slots (no hard ceiling).
export function facilityCapacity(extraSlots: number): number {
  return FACILITY_BASE_CAPACITY + Math.max(0, extraSlots);
}

// Owners have a single tier — the "Owner's Account": free, created on
// passport-claim or self-signup. 1 pet included; beyond that, ¥15/mo per extra
// pet, hard-capped at 10 pets total. Cannot issue passports. (An owner who
// needs more than 10 / wants passports should use a Shop account.)
export const OWNER_EXTRA_PET_CAP = 10;

export const USER_PLANS: Record<string, Plan> = {
  FREE: {
    key: "FREE",
    audience: "user",
    includedPets: 1,
    priceRmb: 0,
    extraPetPriceRmb: 15,
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
