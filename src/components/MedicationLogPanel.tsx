"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge, Card, EmptyState, type Tone } from "@/components/ui";
import { addMedicationLogEntry, deleteMedicationLogEntry } from "@/app/actions";
import { MEDICATION_ROUTES, type MedicationRoute } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";
import { LogOccurredAtField, logFormInputCls } from "@/components/LogOccurredAtField";

export type SerializedMedicationLog = {
  id: string;
  occurredAt: string;
  medicationName: string;
  dose: string;
  route: string;
  notes: string;
  lockedAt?: string | null;
};

export function MedicationLogPanel({
  petId,
  entries,
  readOnly = false,
  canDelete = false,
}: {
  petId: string;
  entries: SerializedMedicationLog[];
  readOnly?: boolean;
  canDelete?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { locale, timeZone };
  const [pending, start] = useTransition();

  function submit(formData: FormData) {
    start(async () => {
      await addMedicationLogEntry(petId, formData);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm(t.medicationLog.deleteConfirm)) return;
    start(async () => {
      await deleteMedicationLogEntry(petId, id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {!readOnly && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-forest">{t.medicationLog.title}</h2>
          <p className="mt-1 text-xs text-muted">{t.medicationLog.subtitle}</p>
          <form action={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
              {t.medicationLog.medicationName}
              <input
                name="medicationName"
                required
                placeholder={t.medicationLog.medicationNamePlaceholder}
                className={`${logFormInputCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {t.medicationLog.dose}
              <input
                name="dose"
                placeholder={t.medicationLog.dosePlaceholder}
                className={`${logFormInputCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {t.medicationLog.route}
              <select name="route" defaultValue="ORAL" className={`${logFormInputCls} mt-1`}>
                {MEDICATION_ROUTES.map((r) => (
                  <option key={r} value={r}>
                    {t.medicationRoute[r]}
                  </option>
                ))}
              </select>
            </label>
            <LogOccurredAtField />
            <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
              {t.medicationLog.notes}
              <input
                name="notes"
                placeholder={t.medicationLog.notesPlaceholder}
                className={`${logFormInputCls} mt-1`}
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pending ? "…" : t.medicationLog.save}
              </button>
            </div>
          </form>
        </Card>
      )}

      {entries.length === 0 ? (
        <EmptyState
          title={t.medicationLog.noEntries}
          description={t.medicationLog.noEntriesDesc}
        />
      ) : (
        <ol className="space-y-3">
          {entries.map((e) => (
            <li key={e.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-forest">{e.medicationName}</span>
                      <Badge tone="violet">{t.medicationRoute[e.route as MedicationRoute]}</Badge>
                      {e.dose && <Badge tone="slate">{e.dose}</Badge>}
                    </div>
                    {e.notes && <p className="mt-1 text-sm text-slate-500">{e.notes}</p>}
                    <p className="mt-2 text-xs text-muted">
                      {formatDateTime(new Date(e.occurredAt), fmt)}
                    </p>
                  </div>
                  {canDelete && !e.lockedAt && (
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                      aria-label={t.timeline.deleteEntry}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
