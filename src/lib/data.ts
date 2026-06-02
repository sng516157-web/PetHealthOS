import { cache } from "react";
import { prisma } from "./prisma";
import { getOrgPlan, getUserPlan, petLimit } from "./plans";

// Single-org prototype: resolve (or lazily create) the active organization.
// Wrapped in cache() so the many callers in one request (layout + page + data
// helpers) share a single DB lookup instead of repeating it.
export const getActiveOrg = cache(async () => {
  let org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "My Cattery & Kennel", kind: "BREEDER" },
    });
  }
  return org;
});

export async function getPetsWithStats() {
  const org = await getActiveOrg();
  const pets = await prisma.pet.findMany({
    where: { orgId: org.id },
    orderBy: { updatedAt: "desc" },
    include: {
      logs: { orderBy: { occurredAt: "desc" }, take: 1 },
      _count: { select: { logs: true } },
    },
  });
  return pets;
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
  const org = await getActiveOrg();
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
  const org = await getActiveOrg();
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

// ---- Notifications ----

export async function getOrgNotifications() {
  const org = await getActiveOrg();
  return prisma.notification.findMany({
    where: { orgId: org.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { pet: { select: { id: true, name: true, species: true } } },
  });
}

export async function getOrgUnreadCount() {
  const org = await getActiveOrg();
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
  const org = await getActiveOrg();
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
