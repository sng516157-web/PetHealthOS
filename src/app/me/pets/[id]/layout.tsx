import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet, getPetEntitlements } from "@/lib/data";
import { OwnerPetChrome } from "@/components/dashboard/OwnerPetChrome";
import { petAge } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";

export default async function MePetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const { t } = await getI18n();
  const pet = await getOwnedPet(user.id, id);
  if (!pet) notFound();
  const deathClaim = await prisma.petDeathClaim.findUnique({
    where: { petId: id },
    select: { status: true },
  });
  const ent = await getPetEntitlements(id);
  const isMemorial = pet.status === "DECEASED";
  const readOnly = isMemorial || ent?.tier === "readonly";
  const canEditPhoto = !isMemorial && (ent?.canLog ?? true);

  let claimBanner: string | null = null;
  if (isMemorial && deathClaim) {
    if (deathClaim.status === "PENDING") claimBanner = t.petClosure.claimPending;
    else if (deathClaim.status === "APPROVED") claimBanner = t.petClosure.claimApproved;
    else if (deathClaim.status === "REJECTED") claimBanner = t.petClosure.claimRejected;
  }

  return (
    <OwnerPetChrome
      petId={pet.id}
      name={pet.name}
      species={pet.species}
      breed={pet.breed}
      photoUrl={pet.photoUrl}
      microchip={pet.microchip}
      canEditMicrochip={canEditPhoto}
      birthDateLabel={pet.birthDate ? (petAge(pet.birthDate) ?? "") : ""}
      ownershipNote={
        isMemorial
          ? t.petClosure.memorialBanner(pet.name)
          : pet.org
            ? t.me.continueNote(pet.org.name)
            : t.me.selfPetNote
      }
      readOnly={readOnly}
      canEditPhoto={canEditPhoto}
      isMemorial={isMemorial}
      backLabel={isMemorial ? t.me.tabMemorial : t.me.backToPets}
      backHref={isMemorial ? "/me?tab=memorial" : "/me"}
      readOnlyBanner={t.account.petReadOnly}
      claimBanner={claimBanner}
    >
      {children}
    </OwnerPetChrome>
  );
}
