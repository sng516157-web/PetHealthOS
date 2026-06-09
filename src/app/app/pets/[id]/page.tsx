import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Stethoscope, Lock } from "lucide-react";
import { getPet, getActiveOrg, isFacilityOrg, getFacilityPetView } from "@/lib/data";
import { QuickAddLog } from "@/components/QuickAddLog";
import { LogTimeline } from "@/components/LogTimeline";
import { RemindersPanel } from "@/components/RemindersPanel";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { WeightPanel } from "@/components/WeightPanel";
import { safeTags } from "@/lib/ai";
import { SEVERITY_META, Severity } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";

function serializeLogs(
  logs: { id: string; occurredAt: Date; rawText: string; type: string; severity: string; title: string | null; summary: string | null; tags: string; imageUrl: string | null; imageMime: string | null; loggedByName: string | null }[],
) {
  return logs.map((l) => ({
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
}

export default async function PetOverview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();

  // ---- Facility (hospital/boarding): windowed, stay-gated view ----
  const org = await getActiveOrg();
  if (org && isFacilityOrg(org)) {
    const view = await getFacilityPetView(id);
    if (!view) notFound();
    const fLogs = serializeLogs(view.pet.logs);
    if (!view.active) {
      return (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <Lock size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <p>{t.facility.readonlyNotice}</p>
          </div>
          <LogTimeline petId={view.pet.id} logs={fLogs} canDelete={false} />
        </div>
      );
    }
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <QuickAddLog petId={view.pet.id} />
          <LogTimeline petId={view.pet.id} logs={fLogs} canDelete={false} />
        </div>
        <div className="space-y-5">
          <RemindersPanel
            petId={view.pet.id}
            reminders={view.pet.reminders.map((r) => ({
              id: r.id,
              title: r.title,
              category: r.category,
              dueAt: r.dueAt.toISOString(),
              completed: r.completed,
              notes: r.notes,
            }))}
          />
          <WeightPanel
            petId={view.pet.id}
            weights={view.pet.weights.map((w) => ({
              id: w.id,
              weightKg: w.weightKg,
              measuredAt: w.measuredAt.toISOString(),
              note: w.note,
            }))}
          />
          <DocumentsPanel
            petId={view.pet.id}
            attachments={view.pet.attachments.map((a) => ({
              id: a.id,
              kind: a.kind,
              label: a.label,
              url: a.url,
              mimeType: a.mimeType,
            }))}
          />
        </div>
      </div>
    );
  }

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
    imageUrl: l.imageUrl,
    imageMime: l.imageMime,
    loggedByName: l.loggedByName,
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
            href={`/app/pets/${pet.id}/triage`}
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
