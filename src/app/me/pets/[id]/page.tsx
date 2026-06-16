import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet, getPetEntitlements } from "@/lib/data";
import { QuickAddLog } from "@/components/QuickAddLog";
import { LogTimeline } from "@/components/LogTimeline";
import { serializeHealthLogs } from "@/lib/pet-serialize";
import { MotionStagger } from "@/components/dashboard/DashboardMotion";

export default async function MePetQuickLogPage({
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
  const logs = serializeHealthLogs(pet.logs);

  return (
    <MotionStagger className="space-y-5" step={90} itemClassName="">
      {canLog ? <QuickAddLog petId={pet.id} ownerConfirm /> : null}
      <LogTimeline
        petId={pet.id}
        logs={logs}
        canDelete={canLog}
        canEdit={canLog}
      />
    </MotionStagger>
  );
}
