import { cache } from "react";
import { redirect } from "next/navigation";
import type { Organization } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";
import {
  getOrgPlan,
  getUserPlan,
  petLimit,
  facilityCapacity,
  FACILITY_BASE_CAPACITY,
} from "./plans";
import {
  syncOrgBillingFromStripe,
  syncUserBillingFromStripe,
} from "./billing";
import {
  getOwnerPetEntitlements,
  type OwnerPetEntitlements,
} from "./owner-slots";
import {
  countActiveOrgCareSlots,
  getFacilityStayEntitlements,
  getShopPetEntitlements,
} from "./org-slots";
import { isFacilityKind } from "./constants";

export function isFacilityOrg(org: { kind: string }): boolean {
  return isFacilityKind(org.kind);
}

// Unified auth: the "active org" is the logged-in shop user's organization.
// A user with an org is a shop/breeder account (/app workspace); a user
// without one is an owner account (/me). Returns null when there is no shop
// context (not logged in, or an owner account). Wrapped in cache() so the
// layout + page + data helpers share a single lookup per request.
export const getActiveOrg = cache(async (): Promise<Organization | null> => {
  const user = await getCurrentUser();
  if (!user?.orgId) return null;
  return prisma.organization.findUnique({ where: { id: user.orgId } });
});

// For breeder (/app) pages and actions that must run in a shop context.
// Redirects unauthenticated/owner users to the shop landing instead of
// throwing on a null org.
export async function requireActiveOrg(): Promise<Organization> {
  const org = await getActiveOrg();
  if (!org) redirect("/shop");
  return org;
}

const petStatsInclude = {
  logs: { orderBy: { occurredAt: "desc" as const }, take: 1 },
  _count: { select: { logs: true } },
};

// Pets the shop is actively caring for (not yet transferred/archived).
export async function getActivePetsWithStats() {
  const org = await requireActiveOrg();
  return prisma.pet.findMany({
    where: {
      orgId: org.id,
      status: { in: ["ACTIVE", "UNDER_OBSERVATION"] },
    },
    orderBy: { updatedAt: "desc" },
    include: petStatsInclude,
  });
}

// Pets that have been transferred (passport issued) or fully handed off (claimed).
export async function getArchivedPetsWithStats() {
  const org = await requireActiveOrg();
  return prisma.pet.findMany({
    where: {
      orgId: org.id,
      status: { in: ["TRANSFERRED", "ARCHIVED"] },
    },
    orderBy: { updatedAt: "desc" },
    include: petStatsInclude,
  });
}

// ---- Facility (hospital / boarding) — stay-based access to owner pets ----

// Pets currently (ACTIVE) or previously (ARCHIVED) in this facility's care.
// Returns items shaped for PetsList, with the stay status as the displayed status.
export async function getFacilityPets(status: "ACTIVE" | "ARCHIVED") {
  const org = await requireActiveOrg();
  const stays = await prisma.petStay.findMany({
    where: { orgId: org.id, status },
    orderBy: { updatedAt: "desc" },
    include: {
      pet: {
        include: {
          logs: { orderBy: { occurredAt: "desc" }, take: 1 },
          _count: { select: { logs: true } },
        },
      },
    },
  });
  return stays.map((s) => ({ stay: s, pet: s.pet }));
}

export async function getFacilityActiveCount() {
  const org = await requireActiveOrg();
  return prisma.petStay.count({ where: { orgId: org.id, status: "ACTIVE" } });
}

// Care capacity: base + purchased extra slots, and how many are in use now.
export async function getFacilityCapacity() {
  const org = await requireActiveOrg();
  await syncOrgBillingFromStripe(org.id);
  const inCare = await prisma.petStay.count({
    where: { orgId: org.id, status: "ACTIVE" },
  });
  const extra = await countActiveOrgCareSlots(org.id);
  if (extra !== org.extraPetSlots) {
    await prisma.organization.update({
      where: { id: org.id },
      data: { extraPetSlots: extra },
    });
  }
  return {
    org,
    inCare,
    base: FACILITY_BASE_CAPACITY,
    extra,
    limit: facilityCapacity(extra),
  };
}

export async function getFacilityStay(petId: string) {
  const org = await requireActiveOrg();
  return prisma.petStay.findUnique({
    where: { petId_orgId: { petId, orgId: org.id } },
  });
}

// Full pet record for a facility, with the privacy window applied: while the
// stay is ACTIVE the facility sees everything; once ARCHIVED it only sees
// records created up to releasedAt (no new owner updates leak while away).
export async function getFacilityPetView(petId: string) {
  const org = await requireActiveOrg();
  const stay = await prisma.petStay.findUnique({
    where: { petId_orgId: { petId, orgId: org.id } },
  });
  if (!stay) return null;
  const active = stay.status === "ACTIVE";
  const cutoff = active ? undefined : (stay.releasedAt ?? stay.createdAt);
  const timeFilter = cutoff ? { createdAt: { lte: cutoff } } : {};
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    include: {
      sire: { select: { id: true, name: true, breed: true } },
      dam: { select: { id: true, name: true, breed: true } },
      attachments: { where: timeFilter, orderBy: { createdAt: "desc" } },
      logs: { where: timeFilter, orderBy: { occurredAt: "desc" } },
      weights: { where: timeFilter, orderBy: { measuredAt: "asc" } },
      reminders: { orderBy: { dueAt: "asc" } },
      reports: { orderBy: { createdAt: "desc" } },
      conversations: { orderBy: { updatedAt: "desc" } },
    },
  });
  if (!pet) return null;
  return { pet, stay, active };
}

// Owner-facing: which facilities currently hold an active stay for this pet.
export async function getPetActiveStays(petId: string) {
  return prisma.petStay.findMany({
    where: { petId, status: "ACTIVE" },
    orderBy: { admittedAt: "desc" },
    include: { org: { select: { id: true, name: true, kind: true } } },
  });
}

export async function getPet(id: string) {
  return prisma.pet.findUnique({
    where: { id },
    include: {
      org: true,
      sire: { select: { id: true, name: true, breed: true } },
      dam: { select: { id: true, name: true, breed: true } },
      attachments: { orderBy: { createdAt: "desc" } },
      logs: { orderBy: { occurredAt: "desc" } },
      weights: { orderBy: { measuredAt: "asc" } },
      reminders: { orderBy: { dueAt: "asc" } },
      reports: { orderBy: { createdAt: "desc" } },
      conversations: { orderBy: { updatedAt: "desc" } },
    },
  });
}

// Candidate lineage parents: same species, excluding the pet itself.
export async function getCandidateParents(species?: string, excludeId?: string) {
  const org = await requireActiveOrg();
  return prisma.pet.findMany({
    where: {
      orgId: org.id,
      ...(species ? { species } : {}),
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { name: "asc" },
    select: { id: true, name: true, species: true, sex: true, breed: true },
  });
}

export async function getPetForAI(id: string) {
  return prisma.pet.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { occurredAt: "desc" } },
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function getUpcomingReminders() {
  const org = await requireActiveOrg();
  return prisma.reminder.findMany({
    where: { pet: { orgId: org.id }, completed: false },
    orderBy: { dueAt: "asc" },
    include: { pet: true },
  });
}

// ---- Consumer (buyer) account scoping ----

export async function getOwnedPets(userId: string) {
  return prisma.pet.findMany({
    where: { ownerUserId: userId },
    orderBy: { updatedAt: "desc" },
    include: {
      logs: { orderBy: { occurredAt: "desc" }, take: 1 },
      _count: { select: { logs: true } },
    },
  });
}

export async function getOwnedPet(userId: string, id: string) {
  const pet = await getPet(id);
  if (!pet || pet.ownerUserId !== userId) return null;
  return pet;
}

// Can the logged-in user touch this pet? True for the owner of the pet, or for a
// member of the shop/org the pet belongs to. Used to gate the AI chat and triage
// (which key off a petId) so one account can't reach another's records.
export async function canAccessPet(petId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    select: { ownerUserId: true, orgId: true },
  });
  if (!pet) return false;
  if (pet.ownerUserId && pet.ownerUserId === user.id) return true;
  if (user.orgId && pet.orgId === user.orgId) return true;
  // Facility access: only while the pet is actively in their care (active stay).
  if (user.orgId) {
    const stay = await prisma.petStay.findUnique({
      where: { petId_orgId: { petId, orgId: user.orgId } },
      select: { status: true },
    });
    if (stay?.status === "ACTIVE") return true;
  }
  return false;
}

export async function getPetEntitlements(
  petId: string,
): Promise<OwnerPetEntitlements | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const pet = await prisma.pet.findUnique({
    where: { id: petId },
    select: { ownerUserId: true, orgId: true },
  });
  if (!pet) return null;
  if (pet.ownerUserId === user.id) {
    return getOwnerPetEntitlements(user.id, petId);
  }
  if (!user.orgId || !(await canAccessPet(petId))) return null;

  const org = await prisma.organization.findUnique({
    where: { id: user.orgId },
    select: { kind: true },
  });
  if (org && isFacilityKind(org.kind)) {
    return getFacilityStayEntitlements(user.orgId, petId);
  }
  if (pet.orgId === user.orgId) {
    return getShopPetEntitlements(user.orgId, petId);
  }
  return { tier: "readonly", canView: true, canLog: false, canUseAI: false };
}

// Is the current actor a facility (hospital/boarding) account? Used to keep
// facilities from deleting an owner's records (they may only add).
export async function currentActorIsFacility(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user?.orgId) return false;
  const org = await prisma.organization.findUnique({
    where: { id: user.orgId },
    select: { kind: true },
  });
  return isFacilityKind(org?.kind);
}

// ---- Notifications ----

export async function getOrgNotifications() {
  const org = await requireActiveOrg();
  return prisma.notification.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { pet: { select: { id: true, name: true, species: true } } },
  });
}

export async function getOrgUnreadCount() {
  const org = await requireActiveOrg();
  return prisma.notification.count({ where: { orgId: org.id, readAt: null } });
}

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { pet: { select: { id: true, name: true, species: true } } },
  });
}

// ---- Billing / quota usage ----

export async function getOrgUsage() {
  const org = await requireActiveOrg();
  await syncOrgBillingFromStripe(org.id);
  const fresh = await prisma.organization.findUnique({ where: { id: org.id } });
  const current = fresh ?? org;
  const plan = getOrgPlan(current.plan);
  const count = await prisma.pet.count({ where: { orgId: org.id } });
  return { org: current, plan, count, limit: petLimit(plan, current.extraPetSlots) };
}

export async function getUserUsage(userId: string) {
  await syncUserBillingFromStripe(userId);
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const plan = getUserPlan(user.plan);
  const count = await prisma.pet.count({ where: { ownerUserId: userId } });
  return { user, plan, count, limit: petLimit(plan, user.extraPetSlots) };
}
