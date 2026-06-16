import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  getActiveOrg,
  isFacilityOrg,
  getFacilityStay,
  getPetEntitlements,
} from "@/lib/data";
import { AppPetChrome } from "@/components/dashboard/AppPetChrome";
import { petAge } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import type { PetStatus, Sex } from "@/lib/constants";
import type { Tone } from "@/components/ui";

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "emerald",
  UNDER_OBSERVATION: "amber",
  TRANSFERRED: "violet",
  ARCHIVED: "slate",
};

export default async function PetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      sire: { select: { id: true, name: true } },
      dam: { select: { id: true, name: true } },
    },
  });
  if (!pet) notFound();

  const org = await getActiveOrg();
  const facility = org ? isFacilityOrg(org) : false;
  const stay = facility ? await getFacilityStay(id) : null;
  if (facility && !stay) notFound();
  const facilityActive = stay?.status === "ACTIVE";
  const ent = await getPetEntitlements(id);
  const slotReadOnly = ent?.tier === "readonly";
  const readOnly = (facility && !facilityActive) || slotReadOnly;
  const includeAI = !facility || facilityActive;
  const includeTriage = !facility || facilityActive;

  const meta = [
    pet.breed,
    pet.sex && pet.sex !== "UNKNOWN" ? t.sex[pet.sex as Sex] : null,
    petAge(pet.birthDate),
    pet.weightKg ? `${pet.weightKg} kg` : null,
    pet.color,
  ].filter(Boolean);

  const badgeLabel = facility
    ? facilityActive
      ? t.facility.statusActive
      : t.facility.statusArchived
    : t.status[pet.status as PetStatus] ?? pet.status;
  const badgeTone = facility
    ? facilityActive
      ? "emerald"
      : "slate"
    : STATUS_TONE[pet.status] ?? "slate";

  return (
    <AppPetChrome
      petId={pet.id}
      name={pet.name}
      species={pet.species}
      speciesLabel={pet.species === "DOG" ? t.species.DOG : t.species.CAT}
      metaLine={meta.join(" · ")}
      photoUrl={pet.photoUrl}
      facility={facility}
      badgeLabel={badgeLabel}
      badgeTone={badgeTone as Tone}
      readOnly={readOnly}
      slotReadOnly={slotReadOnly}
      includeTransfer={!facility && !readOnly}
      includeAI={includeAI}
      includeTriage={includeTriage}
      sire={pet.sire}
      dam={pet.dam}
      sireLabel={t.petDetail.sire}
      damLabel={t.petDetail.dam}
      backLabel={t.petDetail.back}
      readOnlyBanner={t.account.petReadOnly}
    >
      {children}
    </AppPetChrome>
  );
}
