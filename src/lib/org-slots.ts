import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import {
  FACILITY_BASE_CAPACITY,
  facilityCapacity,
  getOrgPlan,
} from "./plans";
import type { OwnerPetEntitlements } from "./owner-slots";

export type OrgSlotKind = "care" | "shop_pet";

function newSlotId(): string {
  return randomBytes(12).toString("hex");
}

export async function countPurchasedOrgCareSlots(orgId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "OrgSlot"
    WHERE "orgId" = ${orgId} AND kind = 'care' AND status IN ('ACTIVE', 'PENDING')
  `;
  return Number(rows[0]?.c ?? 0);
}

/** ACTIVE care slots only — source of truth for facility capacity limit. */
export async function countActiveOrgCareSlots(orgId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "OrgSlot"
    WHERE "orgId" = ${orgId} AND kind = 'care' AND status = 'ACTIVE'
  `;
  return Number(rows[0]?.c ?? 0);
}

/** Sync Organization.extraPetSlots from ACTIVE care slots (facility billing UI). */
export async function syncOrgCareSlotCount(orgId: string): Promise<void> {
  const rows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "OrgSlot"
    WHERE "orgId" = ${orgId} AND kind = 'care' AND status = 'ACTIVE'
  `;
  const active = Number(rows[0]?.c ?? 0);
  await prisma.organization.update({
    where: { id: orgId },
    data: { extraPetSlots: active },
  });
}

export async function createOrgSlot(
  orgId: string,
  kind: OrgSlotKind,
  opts?: { pending?: boolean },
): Promise<string> {
  const id = newSlotId();
  const status = opts?.pending ? "PENDING" : "ACTIVE";
  await prisma.$executeRaw`
    INSERT INTO "OrgSlot" (id, "orgId", kind, status, "createdAt")
    VALUES (${id}, ${orgId}, ${kind}, ${status}, NOW())
  `;
  if (kind === "care" && !opts?.pending) await syncOrgCareSlotCount(orgId);
  return id;
}

export async function activateOrgSlot(slotId: string): Promise<void> {
  const rows = await prisma.$queryRaw<{ orgId: string; kind: string }[]>`
    UPDATE "OrgSlot" SET status = 'ACTIVE'
    WHERE id = ${slotId}
    RETURNING "orgId", kind
  `;
  const row = rows[0];
  if (row?.kind === "care") await syncOrgCareSlotCount(row.orgId);
}

export async function revokeOrgSlot(slotId: string): Promise<void> {
  const rows = await prisma.$queryRaw<{ orgId: string; kind: string; status: string }[]>`
    SELECT "orgId", kind, status FROM "OrgSlot" WHERE id = ${slotId} LIMIT 1
  `;
  const row = rows[0];
  if (!row || row.status === "REVOKED") return;

  await prisma.$executeRaw`
    UPDATE "OrgSlot"
    SET status = 'REVOKED', "revokedAt" = NOW()
    WHERE id = ${slotId}
  `;
  if (row.kind === "care") await syncOrgCareSlotCount(row.orgId);
}

/** Shop: link an extra slot when adding a pet beyond the plan's included count. */
export async function assignShopPetSlot(orgId: string, petId: string): Promise<void> {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true },
  });
  const plan = getOrgPlan(org?.plan);
  const countRows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "Pet" WHERE "orgId" = ${orgId}
  `;
  const petCount = Number(countRows[0]?.c ?? 0);
  if (petCount <= plan.includedPets) return;

  const open = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "OrgSlot"
    WHERE "orgId" = ${orgId} AND kind = 'shop_pet' AND status = 'ACTIVE' AND "petId" IS NULL
    ORDER BY "createdAt" ASC
    LIMIT 1
  `;
  if (!open[0]) return;

  await prisma.$executeRaw`
    UPDATE "OrgSlot" SET "petId" = ${petId} WHERE id = ${open[0].id}
  `;
}

/** Facility: assign a care slot when active stays exceed the base capacity. */
export async function assignCareSlotToStay(
  orgId: string,
  petStayId: string,
): Promise<void> {
  const activeRows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "PetStay"
    WHERE "orgId" = ${orgId} AND status = 'ACTIVE'
  `;
  const activeCount = Number(activeRows[0]?.c ?? 0);
  if (activeCount <= FACILITY_BASE_CAPACITY) return;

  const open = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "OrgSlot"
    WHERE "orgId" = ${orgId} AND kind = 'care' AND status = 'ACTIVE' AND "petStayId" IS NULL
    ORDER BY "createdAt" ASC
    LIMIT 1
  `;
  if (!open[0]) return;

  await prisma.$executeRaw`
    UPDATE "OrgSlot" SET "petStayId" = ${petStayId} WHERE id = ${open[0].id}
  `;
}

export async function clearCareSlotForStay(petStayId: string): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "OrgSlot" SET "petStayId" = NULL
    WHERE "petStayId" = ${petStayId} AND kind = 'care' AND status = 'ACTIVE'
  `;
}

/** Shop-owned pet entitlements for org workspace members. */
export async function getShopPetEntitlements(
  orgId: string,
  petId: string,
): Promise<OwnerPetEntitlements> {
  const full = { canView: true, canLog: true, canUseAI: true } as const;
  const readonly = { canView: true, canLog: false, canUseAI: false } as const;

  const slotRows = await prisma.$queryRaw<{ status: string }[]>`
    SELECT status FROM "OrgSlot" WHERE "petId" = ${petId} AND kind = 'shop_pet' LIMIT 1
  `;
  const slot = slotRows[0];
  if (slot) {
    return slot.status === "ACTIVE"
      ? { tier: "paid", ...full }
      : { tier: "readonly", ...readonly };
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { plan: true },
  });
  const plan = getOrgPlan(org?.plan);
  const pets = await prisma.pet.findMany({
    where: { orgId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const index = pets.findIndex((p) => p.id === petId);
  if (index >= 0 && index < plan.includedPets) {
    return { tier: "included", ...full };
  }

  return { tier: "readonly", ...readonly };
}

/** Facility entitlements while a pet is in active care. */
export async function getFacilityStayEntitlements(
  orgId: string,
  petId: string,
): Promise<OwnerPetEntitlements> {
  const full = { canView: true, canLog: true, canUseAI: true } as const;
  const readonly = { canView: true, canLog: false, canUseAI: false } as const;

  const stayRows = await prisma.$queryRaw<{ id: string; status: string }[]>`
    SELECT id, status FROM "PetStay"
    WHERE "orgId" = ${orgId} AND "petId" = ${petId}
    LIMIT 1
  `;
  const stay = stayRows[0];
  if (!stay || stay.status !== "ACTIVE") {
    return { tier: "readonly", ...readonly };
  }

  const slotRows = await prisma.$queryRaw<{ status: string }[]>`
    SELECT status FROM "OrgSlot" WHERE "petStayId" = ${stay.id} AND kind = 'care' LIMIT 1
  `;
  const slot = slotRows[0];
  if (slot) {
    return slot.status === "ACTIVE"
      ? { tier: "paid", ...full }
      : { tier: "readonly", ...readonly };
  }

  const activeStays = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "PetStay"
    WHERE "orgId" = ${orgId} AND status = 'ACTIVE'
    ORDER BY "admittedAt" ASC
  `;
  const index = activeStays.findIndex((s) => s.id === stay.id);
  if (index >= 0 && index < FACILITY_BASE_CAPACITY) {
    return { tier: "included", ...full };
  }

  return { tier: "readonly", ...readonly };
}

export function facilityCapacityFromSlots(extraCareSlots: number): number {
  return facilityCapacity(extraCareSlots);
}
