import { randomBytes } from "crypto";
import { prisma } from "./prisma";
import { getUserPlan } from "./plans";

export type OwnerPetTier = "included" | "paid" | "readonly";

export type OwnerPetEntitlements = {
  tier: OwnerPetTier;
  canView: boolean;
  canLog: boolean;
  canUseAI: boolean;
};

type SlotRow = {
  id: string;
  userId: string;
  petId: string | null;
  status: string;
};

function newSlotId(): string {
  return randomBytes(12).toString("hex");
}

/** Keep User.extraPetSlots in sync with ACTIVE purchased slots (billing UI). */
export async function countPurchasedOwnerSlots(userId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "OwnerPetSlot"
    WHERE "userId" = ${userId} AND status IN ('ACTIVE', 'PENDING')
  `;
  return Number(rows[0]?.c ?? 0);
}

/** ACTIVE slots only — used for purchase caps and billing display. */
export async function countActiveOwnerSlots(userId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "OwnerPetSlot"
    WHERE "userId" = ${userId} AND status = 'ACTIVE'
  `;
  return Number(rows[0]?.c ?? 0);
}

/** Drop an abandoned checkout slot (PENDING only). */
export async function revokePendingOwnerPetSlot(slotId: string): Promise<void> {
  const rows = await prisma.$queryRaw<{ userId: string; status: string }[]>`
    SELECT "userId", status FROM "OwnerPetSlot" WHERE id = ${slotId} LIMIT 1
  `;
  const row = rows[0];
  if (!row || row.status !== "PENDING") return;
  await prisma.$executeRaw`
    UPDATE "OwnerPetSlot"
    SET status = 'REVOKED', "revokedAt" = NOW()
    WHERE id = ${slotId}
  `;
}

export async function syncOwnerSlotCount(userId: string): Promise<void> {
  const rows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "OwnerPetSlot"
    WHERE "userId" = ${userId} AND status = 'ACTIVE'
  `;
  const active = Number(rows[0]?.c ?? 0);
  await prisma.user.update({
    where: { id: userId },
    data: { extraPetSlots: active },
  });
}

export async function createOwnerPetSlot(
  userId: string,
  opts?: { pending?: boolean },
): Promise<string> {
  const id = newSlotId();
  const status = opts?.pending ? "PENDING" : "ACTIVE";
  await prisma.$executeRaw`
    INSERT INTO "OwnerPetSlot" (id, "userId", status, "createdAt")
    VALUES (${id}, ${userId}, ${status}, NOW())
  `;
  if (!opts?.pending) await syncOwnerSlotCount(userId);
  return id;
}

/** Activate a purchased slot — creates the row if missing (repair after missed webhook). */
export async function ensureOwnerPetSlotActive(
  userId: string,
  slotId: string,
): Promise<void> {
  const rows = await prisma.$queryRaw<{ status: string }[]>`
    SELECT status FROM "OwnerPetSlot" WHERE id = ${slotId} LIMIT 1
  `;
  const row = rows[0];
  if (row) {
    if (row.status !== "ACTIVE") {
      await prisma.$executeRaw`
        UPDATE "OwnerPetSlot"
        SET status = 'ACTIVE', "revokedAt" = NULL
        WHERE id = ${slotId}
      `;
    }
  } else {
    await prisma.$executeRaw`
      INSERT INTO "OwnerPetSlot" (id, "userId", status, "createdAt")
      VALUES (${slotId}, ${userId}, 'ACTIVE', NOW())
    `;
  }
  await syncOwnerSlotCount(userId);
}

export async function activateOwnerPetSlot(slotId: string): Promise<void> {
  const rows = await prisma.$queryRaw<{ userId: string }[]>`
    SELECT "userId" FROM "OwnerPetSlot" WHERE id = ${slotId} LIMIT 1
  `;
  const userId = rows[0]?.userId;
  if (userId) await ensureOwnerPetSlotActive(userId, slotId);
}

export async function revokeOwnerPetSlot(slotId: string): Promise<void> {
  const rows = await prisma.$queryRaw<{ userId: string; status: string }[]>`
    SELECT "userId", status FROM "OwnerPetSlot" WHERE id = ${slotId} LIMIT 1
  `;
  const row = rows[0];
  if (!row || row.status === "REVOKED") return;

  await prisma.$executeRaw`
    UPDATE "OwnerPetSlot"
    SET status = 'REVOKED', "revokedAt" = NOW()
    WHERE id = ${slotId}
  `;
  await syncOwnerSlotCount(row.userId);
}

/** Assign the oldest unassigned ACTIVE slot when adding a pet beyond the free tier. */
export async function assignOwnerPetSlot(userId: string, petId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const plan = getUserPlan(user?.plan);
  const countRows = await prisma.$queryRaw<{ c: bigint }[]>`
    SELECT COUNT(*)::bigint AS c FROM "Pet" WHERE "ownerUserId" = ${userId}
  `;
  const petCount = Number(countRows[0]?.c ?? 0);
  if (petCount <= plan.includedPets) return;

  const open = await prisma.$queryRaw<SlotRow[]>`
    SELECT id, "userId", "petId", status FROM "OwnerPetSlot"
    WHERE "userId" = ${userId} AND status = 'ACTIVE' AND "petId" IS NULL
    ORDER BY "createdAt" ASC
    LIMIT 1
  `;
  if (!open[0]) return;

  await prisma.$executeRaw`
    UPDATE "OwnerPetSlot" SET "petId" = ${petId} WHERE id = ${open[0].id}
  `;
}

export async function getOwnerPetEntitlements(
  userId: string,
  petId: string,
): Promise<OwnerPetEntitlements> {
  const full = { canView: true, canLog: true, canUseAI: true } as const;
  const readonly = {
    canView: true,
    canLog: false,
    canUseAI: false,
  } as const;

  const slotRows = await prisma.$queryRaw<{ status: string; userId: string }[]>`
    SELECT status, "userId" FROM "OwnerPetSlot" WHERE "petId" = ${petId} LIMIT 1
  `;
  const slot = slotRows[0];

  if (slot) {
    if (slot.userId !== userId) {
      return { tier: "readonly", ...readonly };
    }
    if (slot.status === "ACTIVE") {
      return { tier: "paid", ...full };
    }
    return { tier: "readonly", ...readonly };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const plan = getUserPlan(user?.plan);
  const pets = await prisma.pet.findMany({
    where: { ownerUserId: userId },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  const index = pets.findIndex((p) => p.id === petId);
  if (index >= 0 && index < plan.includedPets) {
    return { tier: "included", ...full };
  }

  return { tier: "readonly", ...readonly };
}
