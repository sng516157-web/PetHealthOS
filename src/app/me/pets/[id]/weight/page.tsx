import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet, getPetEntitlements } from "@/lib/data";
import { WeightPanel } from "@/components/WeightPanel";
import { serializeWeights } from "@/lib/pet-serialize";

export default async function MePetWeightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const pet = await getOwnedPet(user.id, id);
  if (!pet) notFound();

  const isMemorial = pet.status === "DECEASED";
  const ent = await getPetEntitlements(id);
  const canLog = !isMemorial && (ent?.canLog ?? true);

  return (
    <WeightPanel
      petId={pet.id}
      weights={serializeWeights(pet.weights)}
      readOnly={!canLog}
    />
  );
}
