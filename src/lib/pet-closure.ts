import "server-only";
import { prisma } from "./prisma";
import { getUserPlan } from "./plans";
import { parseProofDocUrls } from "./pet-closure-shared";

const DEATH_REFUND_MONTHS = 3;
const PAID_TENURE_MS = 1000 * 60 * 60 * 24 * 30 * 6; // ~6 months
const FREE_TENURE_MS = 1000 * 60 * 60 * 24 * 365 * 2; // 2 years

export type DeathClosureEligibility = {
  eligible: boolean;
  reason?: "PAID_TENURE" | "FREE_TENURE" | "INSUFFICIENT_TENURE";
};

/** Owner must have 6+ months on a paid extra-pet slot OR 2+ years on a free account. */
export async function checkDeathClosureEligibility(
  userId: string,
): Promise<DeathClosureEligibility> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });
  if (!user) return { eligible: false, reason: "INSUFFICIENT_TENURE" };

  const paidSince = new Date(Date.now() - PAID_TENURE_MS);
  const paidSlot = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "OwnerPetSlot"
    WHERE "userId" = ${userId}
      AND "stripeSubscriptionId" IS NOT NULL
      AND "createdAt" <= ${paidSince}
    LIMIT 1
  `;
  if (paidSlot[0]) return { eligible: true, reason: "PAID_TENURE" };

  const freeSince = new Date(Date.now() - FREE_TENURE_MS);
  if (user.createdAt <= freeSince) {
    return { eligible: true, reason: "FREE_TENURE" };
  }

  return { eligible: false, reason: "INSUFFICIENT_TENURE" };
}

export async function releaseOwnerSlotForPet(petId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "OwnerPetSlot" SET "petId" = NULL
    WHERE "petId" = ${petId} AND status = 'ACTIVE'
  `;
}

export async function releaseShopSlotForPet(petId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "OrgSlot" SET "petId" = NULL
    WHERE "petId" = ${petId} AND kind = 'shop_pet' AND status = 'ACTIVE'
  `;
}

export function deathCondolenceCreditUsd(): number {
  const plan = getUserPlan("FREE");
  return plan.extraPetPriceUsd * DEATH_REFUND_MONTHS;
}

export { DEATH_REFUND_MONTHS, parseProofDocUrls };
