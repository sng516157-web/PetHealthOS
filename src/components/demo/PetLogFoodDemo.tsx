"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Card, Badge, EmptyState, type Tone } from "@/components/ui";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import {
  INITIAL_FOOD,
  type DemoFoodEntry,
} from "@/components/demo/pet-log-demo-data";
import {
  MEAL_TYPES,
  APPETITE_LEVELS,
  type MealType,
  type AppetiteLevel,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function PetLogFoodDemo() {
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { locale, timeZone };
  const [entries, setEntries] = useState(INITIAL_FOOD);
  const [mealType, setMealType] = useState<MealType>("BREAKFAST");
  const [foodName, setFoodName] = useState("");
  const [portion, setPortion] = useState("");
  const [appetite, setAppetite] = useState<AppetiteLevel>("NORMAL");
  const [notes, setNotes] = useState("");

  function addEntry() {
    if (!foodName.trim()) return;
    const entry: DemoFoodEntry = {
      id: `f-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      mealType,
      foodName: foodName.trim(),
      portion: portion.trim(),
      appetite,
      notes: notes.trim(),
    };
    setEntries((prev) => [entry, ...prev]);
    setFoodName("");
    setPortion("");
    setNotes("");
  }

  function remove(id: string) {
    if (!confirm(t.foodLog.deleteConfirm)) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <PetNavDemoChrome>
      <Card className="p-5">
        <h2 className="text-sm font-semibold text-forest">{t.foodLog.title}</h2>
        <p className="mt-1 text-xs text-muted">{t.foodLog.subtitle}</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-600">
            {t.foodLog.mealType}
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className={`${inputCls} mt-1`}
            >
              {MEAL_TYPES.map((m) => (
                <option key={m} value={m}>
                  {t.mealType[m]}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {t.foodLog.appetite}
            <select
              value={appetite}
              onChange={(e) => setAppetite(e.target.value as AppetiteLevel)}
              className={`${inputCls} mt-1`}
            >
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
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder={t.foodLog.foodNamePlaceholder}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            {t.foodLog.portion}
            <input
              value={portion}
              onChange={(e) => setPortion(e.target.value)}
              placeholder={t.foodLog.portionPlaceholder}
              className={`${inputCls} mt-1`}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600 sm:col-span-2">
            {t.foodLog.notes}
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.foodLog.notesPlaceholder}
              className={`${inputCls} mt-1`}
            />
          </label>
        </div>
        <button
          type="button"
          onClick={addEntry}
          disabled={!foodName.trim()}
          className="mt-4 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {t.foodLog.save}
        </button>
      </Card>

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
                      <Badge
                        tone={
                          (e.appetite === "REFUSED" || e.appetite === "DECREASED"
                            ? "amber"
                            : "emerald") as Tone
                        }
                      >
                        {t.appetiteLevel[e.appetite as AppetiteLevel]}
                      </Badge>
                    </div>
                    {e.portion && (
                      <p className="mt-1 text-sm text-slate-600">{e.portion}</p>
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
