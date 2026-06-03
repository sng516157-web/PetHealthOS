import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet } from "@/lib/data";
import { QuickAddLog } from "@/components/QuickAddLog";
import { LogTimeline } from "@/components/LogTimeline";
import { RemindersPanel } from "@/components/RemindersPanel";
import { WeightPanel } from "@/components/WeightPanel";
import { safeTags } from "@/lib/ai";

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

  const logs = pet.logs.map((l) => ({
    id: l.id,
    occurredAt: l.occurredAt.toISOString(),
    rawText: l.rawText,
    type: l.type,
    severity: l.severity,
    title: l.title,
    summary: l.summary,
    tags: safeTags(l.tags),
  }));

  const reminders = pet.reminders.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    dueAt: r.dueAt.toISOString(),
    completed: r.completed,
    notes: r.notes,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <QuickAddLog petId={pet.id} />
        <LogTimeline petId={pet.id} logs={logs} />
      </div>
      <div className="space-y-5">
        <RemindersPanel petId={pet.id} reminders={reminders} />
        <WeightPanel
          petId={pet.id}
          weights={pet.weights.map((w) => ({
            id: w.id,
            weightKg: w.weightKg,
            measuredAt: w.measuredAt.toISOString(),
            note: w.note,
          }))}
        />
      </div>
    </div>
  );
}
