"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Scale, Plus, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { addWeight, deleteWeight } from "@/app/actions";
import { Card } from "@/components/ui";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";
import { FieldError } from "@/components/FieldError";
import {
  validateWeightKg,
  validatePastOrToday,
  validationMessage,
} from "@/lib/validation";

const TODAY = new Date().toISOString().slice(0, 10);

export type SerializedWeight = {
  id: string;
  weightKg: number;
  measuredAt: string;
  note: string | null;
};

const inputCls =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function WeightPanel({
  petId,
  weights,
}: {
  petId: string;
  weights: SerializedWeight[];
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { timeZone, locale };
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{
    weightKg?: string | null;
    measuredAt?: string | null;
  }>({});

  // weights arrive oldest→newest; show newest first in the list.
  const chrono = weights;
  const recent = [...weights].reverse();
  const latest = chrono[chrono.length - 1];
  const prev = chrono[chrono.length - 2];
  const delta = latest && prev ? latest.weightKg - prev.weightKg : 0;

  function submit(formData: FormData) {
    setError(null);
    const fe = {
      weightKg: validateWeightKg(String(formData.get("weightKg") || ""), true),
      measuredAt: validatePastOrToday(String(formData.get("measuredAt") || ""), false),
    };
    setFieldErr(fe);
    if (fe.weightKg || fe.measuredAt) return;
    startTransition(async () => {
      const res = await addWeight(petId, formData);
      if (res?.error) {
        setError(
          validationMessage(
            t.validation as unknown as Record<string, string>,
            res.error,
            res.error,
          ),
        );
      } else {
        setOpen(false);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    startTransition(async () => {
      await deleteWeight(petId, id);
      router.refresh();
    });
  }

  const max = Math.max(...chrono.map((w) => w.weightKg), 0);
  const min = Math.min(...chrono.map((w) => w.weightKg), max);
  const range = max - min || 1;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Scale size={16} className="text-brand-500" />
        {t.weight.title}
        {latest && (
          <span className="ml-1 font-normal text-muted">
            · {latest.weightKg} kg
          </span>
        )}
        {prev && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              delta > 0
                ? "text-emerald-600"
                : delta < 0
                  ? "text-rose-600"
                  : "text-muted"
            }`}
          >
            {delta > 0 ? (
              <TrendingUp size={12} />
            ) : delta < 0 ? (
              <TrendingDown size={12} />
            ) : (
              <Minus size={12} />
            )}
            {delta > 0 ? "+" : ""}
            {delta.toFixed(2)} kg
          </span>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
        >
          <Plus size={13} /> {t.common.add}
        </button>
      </div>

      {open && (
        <form action={submit} noValidate className="mt-3 space-y-2 rounded-xl bg-background p-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted">
                {t.weight.weightKg}
              </label>
              <input
                name="weightKg"
                type="number"
                step="0.01"
                min="0"
                max="200"
                className={inputCls}
                placeholder="7.2"
              />
              <FieldError code={fieldErr.weightKg} />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-muted">
                {t.weight.date}
              </label>
              <input name="measuredAt" type="date" max={TODAY} className={inputCls} />
              <FieldError code={fieldErr.measuredAt} />
            </div>
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? t.weight.saving : t.weight.save}
          </button>
        </form>
      )}

      {chrono.length === 0 ? (
        <p className="mt-3 text-xs text-muted">
          {t.weight.none}
        </p>
      ) : (
        <>
          {chrono.length > 1 && (
            <div className="mt-3 flex h-16 items-end gap-1">
              {chrono.map((w) => {
                const h = 20 + ((w.weightKg - min) / range) * 80;
                return (
                  <div
                    key={w.id}
                    title={`${w.weightKg} kg · ${formatDate(w.measuredAt, fmt)}`}
                    className="flex-1 rounded-t bg-brand-200"
                    style={{ height: `${h}%` }}
                  />
                );
              })}
            </div>
          )}
          <ul className="mt-3 space-y-1.5">
            {recent.slice(0, 5).map((w) => (
              <li
                key={w.id}
                className="group flex items-center gap-2 text-sm"
              >
                <span className="font-medium text-foreground">
                  {w.weightKg} kg
                </span>
                <span className="text-xs text-muted">
                  {formatDate(w.measuredAt, fmt)}
                </span>
                {w.note && (
                  <span className="truncate text-xs text-slate-400">
                    {w.note}
                  </span>
                )}
                <button
                  onClick={() => remove(w.id)}
                  className="ml-auto text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                  aria-label={t.weight.deleteEntry}
                >
                  <Trash2 size={13} />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
