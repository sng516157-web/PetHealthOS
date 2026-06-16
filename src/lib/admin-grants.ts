import "server-only";

import { prisma } from "./prisma";
import { activatePlan } from "./billing";
import { isFacilityKind } from "./constants";
import {
  countActiveOwnerSlots,
  createOwnerPetSlot,
  reconcileOwnerPetSlotAssignments,
} from "./owner-slots";
import { createOrgSlot } from "./org-slots";
import { getUserPlan, maxExtraSlots } from "./plans";

export type AdminGrantKind = "owner_slot" | "care_slot" | "shop_plan";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: { email: { equals: normalizeEmail(email), mode: "insensitive" } },
    select: {
      id: true,
      email: true,
      name: true,
      orgId: true,
      plan: true,
      org: { select: { id: true, name: true, kind: true, plan: true } },
    },
  });
}

export async function adminGrantEntitlement(
  email: string,
  kind: AdminGrantKind,
): Promise<{ ok: true; message: string } | { error: string }> {
  const trimmed = email.trim();
  if (!trimmed) return { error: "EMAIL_REQUIRED" };

  const user = await findUserByEmail(trimmed);
  if (!user) return { error: "USER_NOT_FOUND" };

  if (kind === "owner_slot") {
    if (user.orgId) return { error: "NOT_OWNER" };
    const plan = getUserPlan(user.plan);
    const purchased = await countActiveOwnerSlots(user.id);
    if (purchased >= maxExtraSlots(plan)) return { error: "CAP_REACHED" };

    await createOwnerPetSlot(user.id, { comped: true });
    await reconcileOwnerPetSlotAssignments(user.id);
    return {
      ok: true,
      message: `Granted 1 comped owner pet slot to ${user.email ?? user.name}.`,
    };
  }

  if (!user.orgId || !user.org) return { error: "NOT_ORG" };

  if (kind === "care_slot") {
    if (!isFacilityKind(user.org.kind)) return { error: "NOT_FACILITY" };
    await createOrgSlot(user.org.id, "care", { comped: true });
    return {
      ok: true,
      message: `Granted 1 comped care slot to ${user.org.name} (${user.email}).`,
    };
  }

  if (kind === "shop_plan") {
    await activatePlan({ kind: "org", id: user.org.id }, "SHOP", "month");
    const label = isFacilityKind(user.org.kind) ? "facility" : "shop";
    return {
      ok: true,
      message: `Activated SHOP plan (monthly) for ${label} ${user.org.name}.`,
    };
  }

  return { error: "BAD_REQUEST" };
}
