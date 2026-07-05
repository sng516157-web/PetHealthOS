import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet, getPetEntitlements } from "@/lib/data";
import { MedicationLogPanel } from "@/components/MedicationLogPanel";
import { serializeMedicationLogs } from "@/lib/pet-serialize";

export default async function MePetMedicationPage({
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
    <MedicationLogPanel
      petId={pet.id}
      entries={serializeMedicationLogs(pet.medicationLogs ?? [])}
      readOnly={!canLog}
      canDelete={canLog}
    />
  );
}
