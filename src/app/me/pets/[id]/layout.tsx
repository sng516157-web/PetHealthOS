import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet, getPetEntitlements } from "@/lib/data";
import { OwnerPetChrome } from "@/components/dashboard/OwnerPetChrome";
import { petAge } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

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
  const ent = await getPetEntitlements(id);
  const readOnly = ent?.tier === "readonly";

  return (
    <OwnerPetChrome
      petId={pet.id}
      name={pet.name}
      species={pet.species}
      breed={pet.breed}
      photoUrl={pet.photoUrl}
      birthDateLabel={pet.birthDate ? (petAge(pet.birthDate) ?? "") : ""}
      orgName={pet.org?.name ?? null}
      readOnly={readOnly}
      backLabel={t.me.backToPets}
      continueNote={t.me.continueNote}
      selfPetNote={t.me.selfPetNote}
      readOnlyBanner={t.account.petReadOnly}
    >
      {children}
    </OwnerPetChrome>
  );
}
