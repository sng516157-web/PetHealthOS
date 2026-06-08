import { cache } from "react";
import { redirect } from "next/navigation";
import type { Organization } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import { getCurrentUser } from "./auth";
import { getOrgPlan, getUserPlan, petLimit } from "./plans";

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
    include: { logs: { orderBy: { occurredAt: "desc" } } },
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
  return false;
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
  const plan = getOrgPlan(org.plan);
  const count = await prisma.pet.count({ where: { orgId: org.id } });
  return { org, plan, count, limit: petLimit(plan, org.extraPetSlots) };
}

export async function getUserUsage(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  const plan = getUserPlan(user.plan);
  const count = await prisma.pet.count({ where: { ownerUserId: userId } });
  return { user, plan, count, limit: petLimit(plan, user.extraPetSlots) };
}
