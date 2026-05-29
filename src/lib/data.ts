import { prisma } from "./prisma";

// Single-org prototype: resolve (or lazily create) the active organization.
export async function getActiveOrg() {
  let org = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "My Cattery & Kennel", kind: "BREEDER" },
    });
  }
  return org;
}

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
