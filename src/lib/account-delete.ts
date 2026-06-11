import "server-only";
import {
  activatePlan,
  cancelAllStripeSubscriptionsForCustomer,
  resolveStripeCustomerId,
  type CheckoutScope,
} from "./billing";
import { prisma } from "./prisma";
import { revokeOrgSlot } from "./org-slots";
import { revokeOwnerPetSlot } from "./owner-slots";

/** Cancel every non-terminal Stripe subscription for a customer. */
export async function cancelBillingForScope(scope: CheckoutScope): Promise<void> {
  const customerId = await resolveStripeCustomerId(scope);
  if (customerId) {
    await cancelAllStripeSubscriptionsForCustomer(customerId);
  }
}

async function revokeAllOwnerSlots(userId: string): Promise<void> {
  const slots = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "OwnerPetSlot"
    WHERE "userId" = ${userId} AND status IN ('ACTIVE', 'PENDING')
  `;
  for (const s of slots) {
    await revokeOwnerPetSlot(s.id);
  }
}

async function revokeAllOrgSlots(orgId: string): Promise<void> {
  const slots = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "OrgSlot"
    WHERE "orgId" = ${orgId} AND status IN ('ACTIVE', 'PENDING')
  `;
  for (const s of slots) {
    await revokeOrgSlot(s.id);
  }
}

/** Permanently remove an owner account and cancel billing. */
export async function deleteOwnerAccount(userId: string): Promise<void> {
  await cancelBillingForScope({ kind: "user", id: userId });
  await revokeAllOwnerSlots(userId);

  // Self-added pets (no breeder org) — full delete; cascades logs, attachments, etc.
  await prisma.pet.deleteMany({
    where: { ownerUserId: userId, orgId: null },
  });

  // Claimed breeder pets — keep the record; drop owner link only.
  await prisma.pet.updateMany({
    where: { ownerUserId: userId, orgId: { not: null } },
    data: { ownerUserId: null },
  });

  await prisma.transfer.updateMany({
    where: { claimedByUserId: userId },
    data: { claimedByUserId: null },
  });

  await prisma.user.delete({ where: { id: userId } });
}

/** Permanently remove a shop/facility workspace, its org, and cancel billing. */
export async function deleteOrgAccount(userId: string, orgId: string): Promise<void> {
  await cancelBillingForScope({ kind: "org", id: orgId });
  // Shop users may also have a personal Stripe customer from edge cases.
  await cancelBillingForScope({ kind: "user", id: userId });

  await revokeAllOrgSlots(orgId);
  await activatePlan({ kind: "org", id: orgId }, "STARTER");

  // Pets already claimed by owners survive without this org.
  await prisma.pet.updateMany({
    where: { orgId, ownerUserId: { not: null } },
    data: { orgId: null },
  });

  await prisma.transfer.updateMany({
    where: { claimedByUserId: userId },
    data: { claimedByUserId: null },
  });

  await prisma.user.delete({ where: { id: userId } });
  await prisma.organization.delete({ where: { id: orgId } });
}
