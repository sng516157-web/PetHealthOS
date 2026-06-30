import { prisma } from "./prisma";
import {
  FOUNDING_BREEDER_EARLY_PLAN_KEY,
  FOUNDING_BREEDER_LIFETIME_PLAN_KEY,
  foundingBreederEarlyLimit,
} from "./founding-breeder-lifetime.constants";

export {
  FOUNDING_BREEDER_EARLY_PLAN_KEY,
  FOUNDING_BREEDER_EARLY_PRICE_USD,
  FOUNDING_BREEDER_LIFETIME_PLAN_KEY,
  FOUNDING_BREEDER_LIFETIME_PRICE_USD,
  foundingBreederEarlyStripePriceId,
  foundingBreederLifetimeStripePriceId,
  foundingBreederEarlyLimit,
  foundingBreederLifetimeLimit,
  isFoundingBreederEarlyPlan,
  isFoundingBreederLifetimePlan,
  isFoundingBreederPaidLifetimePlan,
  isPaidBreederOrgPlan,
  foundingBreederPlanKey,
  foundingBreederPriceUsd,
} from "./founding-breeder-lifetime.constants";
export type { FoundingBreederTier } from "./founding-breeder-lifetime.constants";

export type FoundingSpotAvailability = {
  limit: number;
  claimed: number;
  remaining: number;
  soldOut: boolean;
};

export async function countFoundingBreederEarlyOrgs(): Promise<number> {
  return prisma.organization.count({
    where: { plan: FOUNDING_BREEDER_EARLY_PLAN_KEY },
  });
}

export async function countFoundingBreederLifetimeOrgs(): Promise<number> {
  return prisma.organization.count({
    where: { plan: FOUNDING_BREEDER_LIFETIME_PLAN_KEY },
  });
}

export async function getFoundingBreederEarlyAvailability(): Promise<FoundingSpotAvailability> {
  const limit = foundingBreederEarlyLimit();
  const claimed = await countFoundingBreederEarlyOrgs();
  const remaining = Math.max(0, limit - claimed);
  return { limit, claimed, remaining, soldOut: remaining <= 0 };
}

/** @deprecated Use getFoundingBreederEarlyAvailability — kept for imports during migration. */
export async function getFoundingBreederLifetimeAvailability(): Promise<FoundingSpotAvailability> {
  return getFoundingBreederEarlyAvailability();
}

export async function getFoundingBreederOffersAvailability(): Promise<{
  early: FoundingSpotAvailability;
  lifetime: { available: true };
}> {
  const early = await getFoundingBreederEarlyAvailability();
  return { early, lifetime: { available: true } };
}
