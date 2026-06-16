"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge, Card, EmptyState, type Tone } from "@/components/ui";
import { addActivityLogEntry, deleteActivityLogEntry } from "@/app/actions";
import {
  ACTIVITY_TYPES,
  ACTIVITY_INTENSITIES,
  type ActivityType,
  type ActivityIntensity,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";

export type SerializedActivityLog = {
  id: string;
  occurredAt: string;
  activityType: string;
  durationMin: number | null;
  distanceKm: number | null;
  intensity: string;
  notes: string;
  lockedAt?: string | null;
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function ActivityLogPanel({
  petId,
  entries,
  readOnly = false,
  canDelete = false,
}: {
  petId: string;
  entries: SerializedActivityLog[];
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
      await addActivityLogEntry(petId, formData);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm(t.activityLog.deleteConfirm)) return;
    start(async () => {
      await deleteActivityLogEntry(petId, id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {!readOnly && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-forest">{t.activityLog.title}</h2>
          <p className="mt-1 text-xs text-muted">{t.activityLog.subtitle}</p>
          <form action={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600">
              {t.activityLog.activityType}
              <select name="activityType" defaultValue="WALK" className={`${inputCls} mt-1`}>
                {ACTIVITY_TYPES.map((a) => (
                  <option key={a} value={a}>
                    {t.activityType[a]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {t.activityLog.intensity}
              <select name="intensity" defaultValue="MODERATE" className={`${inputCls} mt-1`}>
                {ACTIVITY_INTENSITIES.map((i) => (
                  <option key={i} value={i}>
                    {t.activityIntensity[i]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {t.activityLog.duration}
              <input
                name="durationMin"
                type="number"
                min={1}
                required
                placeholder={t.activityLog.durationPlaceholder}
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {t.activityLog.distance}
              <input
                name="distanceKm"
                type="number"
                step="0.1"
                min={0}
                placeholder={t.activityLog.distancePlaceholder}
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
              {t.activityLog.notes}
              <input
                name="notes"
                placeholder={t.activityLog.notesPlaceholder}
                className={`${inputCls} mt-1`}
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pending ? "…" : t.activityLog.save}
              </button>
            </div>
          </form>
        </Card>
      )}

      {entries.length === 0 ? (
        <EmptyState title={t.activityLog.noEntries} description={t.activityLog.noEntriesDesc} />
      ) : (
        <ol className="space-y-3">
          {entries.map((e) => (
            <li key={e.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-forest">
                        {t.activityType[e.activityType as ActivityType]}
                      </span>
                      {e.durationMin != null && (
                        <Badge tone="brand">{e.durationMin} min</Badge>
                      )}
                      <Badge tone={intensityTone(e.intensity)}>
                        {t.activityIntensity[e.intensity as ActivityIntensity]}
                      </Badge>
                    </div>
                    {e.distanceKm != null && (
                      <p className="mt-1 text-sm text-slate-600">{e.distanceKm} km</p>
                    )}
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

function intensityTone(intensity: string): Tone {
  if (intensity === "VIGOROUS") return "rose";
  if (intensity === "MODERATE") return "amber";
  return "sky";
}
