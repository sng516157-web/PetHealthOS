"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, Badge, EmptyState, type Tone } from "@/components/ui";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import {
  INITIAL_ACTIVITY,
  type DemoActivityEntry,
} from "@/components/demo/pet-log-demo-data";
import {
  ACTIVITY_TYPES,
  ACTIVITY_INTENSITIES,
  type ActivityType,
  type ActivityIntensity,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function PetLogActivityDemo() {
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { locale, timeZone };
  const [entries, setEntries] = useState(INITIAL_ACTIVITY);
  const [activityType, setActivityType] = useState<ActivityType>("WALK");
  const [durationMin, setDurationMin] = useState("");
  const [intensity, setIntensity] = useState<ActivityIntensity>("MODERATE");
  const [distanceKm, setDistanceKm] = useState("");
  const [notes, setNotes] = useState("");

  function addEntry() {
    const mins = parseInt(durationMin, 10);
    if (!mins || mins < 1) return;
    const entry: DemoActivityEntry = {
      id: `a-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      activityType,
      durationMin: mins,
      intensity,
      distanceKm: distanceKm.trim(),
      notes: notes.trim(),
    };
    setEntries((prev) => [entry, ...prev]);
    setDurationMin("");
    setDistanceKm("");
    setNotes("");
  }

  function remove(id: string) {
    if (!confirm(t.activityLog.deleteConfirm)) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <PetNavDemoChrome>
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-forest">{t.activityLog.title}</h2>
        <p className="mt-1 text-xs text-muted">{t.activityLog.subtitle}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            {t.activityLog.activityType}
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType)}
              className={`${inputCls} mt-1`}
            >
              {ACTIVITY_TYPES.map((a) => (
                <option key={a} value={a}>
                  {t.activityType[a]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {t.activityLog.intensity}
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value as ActivityIntensity)}
              className={`${inputCls} mt-1`}
            >
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
              type="number"
              min={1}
              value={durationMin}
              onChange={(e) => setDurationMin(e.target.value)}
              placeholder={t.activityLog.durationPlaceholder}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {t.activityLog.distance}
            <input
              value={distanceKm}
              onChange={(e) => setDistanceKm(e.target.value)}
              placeholder={t.activityLog.distancePlaceholder}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
            {t.activityLog.notes}
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.activityLog.notesPlaceholder}
              className={`${inputCls} mt-1`}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={addEntry}
          disabled={!durationMin || parseInt(durationMin, 10) < 1}
          className="mt-4 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t.activityLog.save}
        </button>
      </Card>

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
                      <Badge tone="brand">{e.durationMin} min</Badge>
                      <Badge tone={intensityTone(e.intensity)}>{t.activityIntensity[e.intensity as ActivityIntensity]}</Badge>
                    </div>
                    {e.distanceKm && (
                      <p className="mt-1 text-sm text-slate-600">{e.distanceKm} km</p>
                    )}
                    {e.notes && <p className="mt-1 text-sm text-slate-500">{e.notes}</p>}
                    <p className="mt-2 text-xs text-muted">
                      {formatDateTime(new Date(e.occurredAt), fmt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(e.id)}
                    className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                    aria-label={t.timeline.deleteEntry}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Card>
            </li>
          ))}
        </ol>
      )}
    </PetNavDemoChrome>
  );
}

function intensityTone(intensity: string): Tone {
  if (intensity === "VIGOROUS") return "rose";
  if (intensity === "MODERATE") return "amber";
  return "sky";
}
