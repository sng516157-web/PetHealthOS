import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet, getPetActiveStays, getPetEntitlements } from "@/lib/data";
import { QuickAddLog } from "@/components/QuickAddLog";
import { LogTimeline } from "@/components/LogTimeline";
import { RemindersPanel } from "@/components/RemindersPanel";
import { WeightPanel } from "@/components/WeightPanel";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { CheckinQR } from "@/components/CheckinQR";
import { ClosePetPanel } from "@/components/ClosePetPanel";
import { PetOverviewGrid } from "@/components/dashboard/PetOverviewMotion";
import { safeTags } from "@/lib/ai";
import {
  checkDeathClosureEligibility,
  deathCondolenceCreditUsd,
} from "@/lib/pet-closure";

export default async function MePetPage({
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
  const activeStays = isMemorial
    ? []
    : (await getPetActiveStays(id)).map((s) => ({
        id: s.id,
        orgName: s.org.name,
      }));

  const logs = pet.logs.map((l) => ({
    id: l.id,
    occurredAt: l.occurredAt.toISOString(),
    rawText: l.rawText,
    type: l.type,
    severity: l.severity,
    title: l.title,
    summary: l.summary,
    tags: safeTags(l.tags),
    imageUrl: l.imageUrl,
    imageMime: l.imageMime,
    loggedByName: l.loggedByName,
  }));

  const reminders = pet.reminders.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    dueAt: r.dueAt.toISOString(),
    recurrence: r.recurrence,
    completed: r.completed,
    notes: r.notes,
  }));

  let closePanel = null;
  if (!isMemorial) {
    const eligibility = await checkDeathClosureEligibility(user.id);
    closePanel = (
      <ClosePetPanel
        key="close"
        petId={pet.id}
        petName={pet.name}
        deathEligible={eligibility.eligible}
        condolenceCreditUsd={deathCondolenceCreditUsd()}
      />
    );
  }

  const main = [
    canLog ? <QuickAddLog key="log" petId={pet.id} /> : null,
    <LogTimeline key="timeline" petId={pet.id} logs={logs} canDelete={!isMemorial} />,
  ].filter(Boolean);

  const sidebar = [
    !isMemorial ? (
      <CheckinQR key="checkin" petId={pet.id} activeStays={activeStays} />
    ) : null,
    <RemindersPanel key="reminders" petId={pet.id} reminders={reminders} readOnly={!canLog} />,
    <WeightPanel
      key="weight"
      petId={pet.id}
      readOnly={!canLog}
      weights={pet.weights.map((w) => ({
        id: w.id,
        weightKg: w.weightKg,
        measuredAt: w.measuredAt.toISOString(),
        note: w.note,
      }))}
    />,
    <DocumentsPanel
      key="docs"
      petId={pet.id}
      readOnly={!canLog}
      attachments={pet.attachments.map((a) => ({
        id: a.id,
        kind: a.kind,
        label: a.label,
        url: a.url,
        mimeType: a.mimeType,
      }))}
    />,
    closePanel,
  ].filter(Boolean);

  return <PetOverviewGrid main={main} sidebar={sidebar} />;
}
