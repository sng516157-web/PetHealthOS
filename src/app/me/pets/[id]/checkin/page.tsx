import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import {
  getOwnedPet,
  getPetActiveStays,
} from "@/lib/data";
import { CheckinQR } from "@/components/CheckinQR";
import { ClosePetPanel } from "@/components/ClosePetPanel";
import {
  checkDeathClosureEligibility,
  deathCondolenceCreditUsd,
} from "@/lib/pet-closure";

export default async function MePetCheckinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const pet = await getOwnedPet(user.id, id);
  if (!pet) notFound();

  if (pet.status === "DECEASED") notFound();

  const activeStays = (await getPetActiveStays(id)).map((s) => ({
    id: s.id,
    orgName: s.org.name,
  }));

  const eligibility = await checkDeathClosureEligibility(user.id);

  return (
    <div className="space-y-5">
      <CheckinQR petId={pet.id} activeStays={activeStays} />
      <ClosePetPanel
        petId={pet.id}
        petName={pet.name}
        deathEligible={eligibility.eligible}
        condolenceCreditUsd={deathCondolenceCreditUsd()}
      />
    </div>
  );
}
