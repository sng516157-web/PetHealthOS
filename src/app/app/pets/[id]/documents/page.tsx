import { notFound } from "next/navigation";
import {
  getPet,
  getActiveOrg,
  isFacilityOrg,
  getFacilityPetView,
  getPetEntitlements,
} from "@/lib/data";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { serializeAttachments } from "@/lib/pet-serialize";

async function loadAppPet(id: string) {
  const org = await getActiveOrg();
  if (org && isFacilityOrg(org)) {
    const view = await getFacilityPetView(id);
    if (!view) return null;
    const ent = await getPetEntitlements(id);
    return {
      pet: view.pet,
      canLog: view.active && (ent?.canLog ?? true),
    };
  }
  const pet = await getPet(id);
  if (!pet) return null;
  const ent = await getPetEntitlements(id);
  return { pet, canLog: ent?.canLog ?? true };
}

export default async function AppPetDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await loadAppPet(id);
  if (!ctx) notFound();

  return (
    <DocumentsPanel
      petId={ctx.pet.id}
      attachments={serializeAttachments(ctx.pet.attachments)}
      readOnly={!ctx.canLog}
    />
  );
}
