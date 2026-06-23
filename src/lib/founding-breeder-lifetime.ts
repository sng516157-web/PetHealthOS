import { prisma } from "./prisma";
import {
  FOUNDING_BREEDER_LIFETIME_PLAN_KEY,
  foundingBreederLifetimeLimit,
} from "./founding-breeder-lifetime.constants";

export {
  FOUNDING_BREEDER_LIFETIME_PLAN_KEY,
  FOUNDING_BREEDER_LIFETIME_PRICE_USD,
  foundingBreederLifetimeStripePriceId,
  foundingBreederLifetimeLimit,
  isFoundingBreederLifetimePlan,
  isPaidBreederOrgPlan,
} from "./founding-breeder-lifetime.constants";

export async function countFoundingBreederLifetimeOrgs(): Promise<number> {
  return prisma.organization.count({
    where: { plan: FOUNDING_BREEDER_LIFETIME_PLAN_KEY },
  });
}

export async function getFoundingBreederLifetimeAvailability(): Promise<{
  limit: number;
  claimed: number;
  remaining: number;
  soldOut: boolean;
}> {
  const limit = foundingBreederLifetimeLimit();
  const claimed = await countFoundingBreederLifetimeOrgs();
  const remaining = Math.max(0, limit - claimed);
  return { limit, claimed, remaining, soldOut: remaining <= 0 };
}
