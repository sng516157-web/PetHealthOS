import { prisma } from "@/lib/prisma";

export type ShopOnboardingProgress = {
  hasPet: boolean;
  hasVaccineLog: boolean;
  hasPassport: boolean;
  complete: boolean;
};

export async function getShopOnboardingProgress(
  orgId: string,
): Promise<ShopOnboardingProgress> {
  const [petCount, vaccineLogCount, passportCount] = await Promise.all([
    prisma.pet.count({
      where: { orgId, status: { in: ["ACTIVE", "UNDER_OBSERVATION"] } },
    }),
    prisma.logEntry.count({
      where: { pet: { orgId }, type: "VACCINE" },
    }),
    prisma.transfer.count({ where: { pet: { orgId } } }),
  ]);
  const hasPet = petCount > 0;
  const hasVaccineLog = vaccineLogCount > 0;
  const hasPassport = passportCount > 0;
  return {
    hasPet,
    hasVaccineLog,
    hasPassport,
    complete: hasPet && hasVaccineLog && hasPassport,
  };
}
