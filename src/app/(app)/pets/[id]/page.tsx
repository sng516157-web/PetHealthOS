import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Stethoscope } from "lucide-react";
import { getPet } from "@/lib/data";
import { QuickAddLog } from "@/components/QuickAddLog";
import { LogTimeline } from "@/components/LogTimeline";
import { RemindersPanel } from "@/components/RemindersPanel";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { WeightPanel } from "@/components/WeightPanel";
import { safeTags } from "@/lib/ai";
import { SEVERITY_META, Severity } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";

export default async function PetOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const pet = await getPet(id);
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

  // Proactive flag: serious entry in the last 14 days
  const now = Date.now();
  const flagged = pet.logs.filter(
    (l) =>
      now - l.occurredAt.getTime() < 1000 * 60 * 60 * 24 * 14 &&
      SEVERITY_META[l.severity as Severity].rank >= 3,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        {flagged.length > 0 && (
          <Link
            href={`/pets/${pet.id}/triage`}
            className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 transition hover:bg-orange-100/70"
          >
            <AlertTriangle size={20} className="mt-0.5 shrink-0 text-orange-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900">
                {t.petDetail.attentionTitle(flagged.length)}
              </p>
              <p className="mt-0.5 text-sm text-orange-800">
                {t.petDetail.attentionDesc(pet.name)}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-orange-900 underline">
                <Stethoscope size={14} /> {t.petDetail.goToTriage}
              </span>
            </div>
          </Link>
        )}

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
        <DocumentsPanel
          petId={pet.id}
          attachments={pet.attachments.map((a) => ({
            id: a.id,
            kind: a.kind,
            label: a.label,
            url: a.url,
            mimeType: a.mimeType,
          }))}
        />
        {pet.notes && (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <h3 className="text-sm font-semibold text-foreground">{t.petDetail.profileNotes}</h3>
            <p className="mt-2 text-sm text-slate-600">{pet.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
