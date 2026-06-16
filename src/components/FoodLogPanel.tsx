"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge, Card, EmptyState, type Tone } from "@/components/ui";
import { addFoodLogEntry, deleteFoodLogEntry } from "@/app/actions";
import {
  MEAL_TYPES,
  APPETITE_LEVELS,
  type MealType,
  type AppetiteLevel,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";

export type SerializedFoodLog = {
  id: string;
  occurredAt: string;
  mealType: string;
  foodName: string;
  amount: string;
  appetite: string;
  notes: string;
  lockedAt?: string | null;
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function FoodLogPanel({
  petId,
  entries,
  readOnly = false,
  canDelete = false,
}: {
  petId: string;
  entries: SerializedFoodLog[];
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
      await addFoodLogEntry(petId, formData);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm(t.foodLog.deleteConfirm)) return;
    start(async () => {
      await deleteFoodLogEntry(petId, id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {!readOnly && (
        <Card className="p-5">
          <h2 className="text-sm font-semibold text-forest">{t.foodLog.title}</h2>
          <p className="mt-1 text-xs text-muted">{t.foodLog.subtitle}</p>
          <form action={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-medium text-slate-600">
              {t.foodLog.mealType}
              <select name="mealType" defaultValue="BREAKFAST" className={`${inputCls} mt-1`}>
                {MEAL_TYPES.map((m) => (
                  <option key={m} value={m}>
                    {t.mealType[m]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {t.foodLog.appetite}
              <select name="appetite" defaultValue="NORMAL" className={`${inputCls} mt-1`}>
                {APPETITE_LEVELS.map((a) => (
                  <option key={a} value={a}>
                    {t.appetiteLevel[a]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
              {t.foodLog.foodName}
              <input
                name="foodName"
                required
                placeholder={t.foodLog.foodNamePlaceholder}
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600">
              {t.foodLog.portion}
              <input
                name="amount"
                placeholder={t.foodLog.portionPlaceholder}
                className={`${inputCls} mt-1`}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
              {t.foodLog.notes}
              <input
                name="notes"
                placeholder={t.foodLog.notesPlaceholder}
                className={`${inputCls} mt-1`}
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {pending ? "…" : t.foodLog.save}
              </button>
            </div>
          </form>
        </Card>
      )}

      {entries.length === 0 ? (
        <EmptyState title={t.foodLog.noEntries} description={t.foodLog.noEntriesDesc} />
      ) : (
        <ol className="space-y-3">
          {entries.map((e) => (
            <li key={e.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-forest">{e.foodName}</span>
                      <Badge tone="sky">{t.mealType[e.mealType as MealType]}</Badge>
                      <Badge tone={appetiteTone(e.appetite)}>
                        {t.appetiteLevel[e.appetite as AppetiteLevel]}
                      </Badge>
                    </div>
                    {e.amount && <p className="mt-1 text-sm text-slate-600">{e.amount}</p>}
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

function appetiteTone(appetite: string): Tone {
  if (appetite === "REFUSED" || appetite === "DECREASED") return "amber";
  if (appetite === "INCREASED") return "emerald";
  return "sky";
}
