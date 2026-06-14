import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Stethoscope, Lock } from "lucide-react";
import {
  getPet,
  getActiveOrg,
  isFacilityOrg,
  getFacilityPetView,
  getPetEntitlements,
} from "@/lib/data";
import { QuickAddLog } from "@/components/QuickAddLog";
import { LogTimeline } from "@/components/LogTimeline";
import { RemindersPanel } from "@/components/RemindersPanel";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { WeightPanel } from "@/components/WeightPanel";
import { PetOverviewGrid } from "@/components/dashboard/PetOverviewMotion";
import { MotionStagger } from "@/components/dashboard/DashboardMotion";
import { safeTags } from "@/lib/ai";
import { SEVERITY_META, Severity } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";

function serializeLogs(
  logs: {
    id: string;
    occurredAt: Date;
    rawText: string;
    type: string;
    severity: string;
    title: string | null;
    summary: string | null;
    tags: string;
    imageUrl: string | null;
    imageMime: string | null;
    loggedByName: string | null;
  }[],
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

  const org = await getActiveOrg();
  if (org && isFacilityOrg(org)) {
    const view = await getFacilityPetView(id);
    if (!view) notFound();
    const fLogs = serializeLogs(view.pet.logs);
    if (!view.active) {
      return (
        <MotionStagger className="space-y-5" step={90} itemClassName="">
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-soft">
            <Lock size={18} className="mt-0.5 shrink-0 text-slate-400" />
            <p>{t.facility.readonlyNotice}</p>
          </div>
          <LogTimeline petId={view.pet.id} logs={fLogs} canDelete={false} />
        </MotionStagger>
      );
    }
    const ent = await getPetEntitlements(view.pet.id);
    const canLog = ent?.canLog ?? true;
    return (
      <PetOverviewGrid
        main={[
          canLog ? <QuickAddLog key="log" petId={view.pet.id} /> : null,
          <LogTimeline key="timeline" petId={view.pet.id} logs={fLogs} canDelete={false} />,
        ].filter(Boolean)}
        sidebar={[
          <RemindersPanel
            key="reminders"
            petId={view.pet.id}
            reminders={view.pet.reminders.map((r) => ({
              id: r.id,
              title: r.title,
              category: r.category,
              dueAt: r.dueAt.toISOString(),
              recurrence: r.recurrence,
              completed: r.completed,
              notes: r.notes,
            }))}
            readOnly={!canLog}
          />,
          <WeightPanel
            key="weight"
            petId={view.pet.id}
            readOnly={!canLog}
            weights={view.pet.weights.map((w) => ({
              id: w.id,
              weightKg: w.weightKg,
              measuredAt: w.measuredAt.toISOString(),
              note: w.note,
            }))}
          />,
          <DocumentsPanel
            key="docs"
            petId={view.pet.id}
            readOnly={!canLog}
            attachments={view.pet.attachments.map((a) => ({
              id: a.id,
              kind: a.kind,
              label: a.label,
              url: a.url,
              mimeType: a.mimeType,
            }))}
          />,
        ]}
      />
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
    recurrence: r.recurrence,
    completed: r.completed,
    notes: r.notes,
  }));

  const now = Date.now();
  const flagged = pet.logs.filter(
    (l) =>
      now - l.occurredAt.getTime() < 1000 * 60 * 60 * 24 * 14 &&
      SEVERITY_META[l.severity as Severity].rank >= 3,
  );
  const ent = await getPetEntitlements(pet.id);
  const canLog = ent?.canLog ?? true;
  const canUseAI = ent?.canUseAI ?? true;

  const main = [
    flagged.length > 0 && canUseAI ? (
      <Link
        key="flag"
        href={`/app/pets/${pet.id}/triage`}
        className="flex items-start gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 shadow-soft transition hover:border-orange-300 hover:bg-orange-100/70"
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
    ) : null,
    canLog ? <QuickAddLog key="log" petId={pet.id} /> : null,
    <LogTimeline key="timeline" petId={pet.id} logs={logs} />,
  ].filter(Boolean);

  const sidebar = [
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
    pet.notes ? (
      <div
        key="notes"
        className="rounded-2xl border border-border bg-surface/90 p-4 shadow-soft backdrop-blur"
      >
        <h3 className="text-sm font-semibold text-foreground">{t.petDetail.profileNotes}</h3>
        <p className="mt-2 text-sm text-slate-600">{pet.notes}</p>
      </div>
    ) : null,
  ].filter(Boolean);

  return <PetOverviewGrid main={main} sidebar={sidebar} />;
}
