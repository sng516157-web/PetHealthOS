"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Scale, Plus, Trash2, TrendingUp, TrendingDown, Minus, Pencil, ChevronDown } from "lucide-react";
import { addWeight, deleteWeight, updateWeight } from "@/app/actions";
import { Card } from "@/components/ui";
import { WeightLineChart } from "@/components/WeightLineChart";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";
import { FieldError } from "@/components/FieldError";
import { cn } from "@/lib/cn";
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

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

function WeightForm({
  entry,
  submitLabel,
  onCancel,
  onSubmit,
  pending,
  error,
  fieldErr,
}: {
  entry?: SerializedWeight;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (formData: FormData) => void;
  pending: boolean;
  error: string | null;
  fieldErr: { weightKg?: string | null; measuredAt?: string | null };
}) {
  const { t } = useI18n();

  return (
    <form action={onSubmit} noValidate className="space-y-2 rounded-xl bg-background p-3">
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
            defaultValue={entry?.weightKg}
            className={inputCls}
            placeholder="7.2"
          />
          <FieldError code={fieldErr.weightKg} />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-medium text-muted">
            {t.weight.date}
          </label>
          <input
            name="measuredAt"
            type="date"
            max={TODAY}
            defaultValue={entry ? toDateInput(entry.measuredAt) : undefined}
            className={inputCls}
          />
          <FieldError code={fieldErr.measuredAt} />
        </div>
      </div>
      <input
        name="note"
        defaultValue={entry?.note ?? ""}
        placeholder={t.weight.note}
        className={inputCls}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            {t.common.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? t.weight.saving : submitLabel}
        </button>
      </div>
    </form>
  );
}

export function WeightPanel({
  petId,
  weights,
  readOnly = false,
}: {
  petId: string;
  weights: SerializedWeight[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { timeZone, locale };
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{
    weightKg?: string | null;
    measuredAt?: string | null;
  }>({});

  const chrono = weights;
  const recent = [...weights].reverse();
  const latest = chrono[chrono.length - 1];
  const prev = chrono[chrono.length - 2];
  const delta = latest && prev ? latest.weightKg - prev.weightKg : 0;

  function validateForm(formData: FormData) {
    const fe = {
      weightKg: validateWeightKg(String(formData.get("weightKg") || ""), true),
      measuredAt: validatePastOrToday(String(formData.get("measuredAt") || ""), false),
    };
    setFieldErr(fe);
    return !(fe.weightKg || fe.measuredAt);
  }

  function submit(formData: FormData) {
    setError(null);
    if (!validateForm(formData)) return;
    startTransition(async () => {
      const res = await addWeight(petId, formData);
      if (res && "error" in res) {
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

  function saveEdit(id: string, formData: FormData) {
    setError(null);
    if (!validateForm(formData)) return;
    startTransition(async () => {
      const res = await updateWeight(petId, id, formData);
      if (res && "error" in res) {
        setError(
          validationMessage(
            t.validation as unknown as Record<string, string>,
            res.error,
            res.error,
          ),
        );
      } else {
        setEditingId(null);
        router.refresh();
      }
    });
  }

  function remove(id: string) {
    if (!confirm(t.weight.deleteConfirm)) return;
    startTransition(async () => {
      await deleteWeight(petId, id);
      if (editingId === id) setEditingId(null);
      router.refresh();
    });
  }


  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Scale size={16} className="text-brand-500" />
        {t.weight.title}
        {latest && (
          <span className="ml-1 font-normal text-muted">
            · {t.weight.current}: {latest.weightKg} kg
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
        {!readOnly && (
          <button
            onClick={() => {
              setOpen((v) => !v);
              setEditingId(null);
            }}
            className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
          >
            <Plus size={13} /> {t.common.add}
          </button>
        )}
      </div>

      {open && !readOnly && (
        <div className="mt-3">
          <WeightForm
            submitLabel={t.weight.save}
            onSubmit={submit}
            pending={pending}
            error={error}
            fieldErr={fieldErr}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}

      {chrono.length === 0 ? (
        <p className="mt-3 text-xs text-muted">{t.weight.none}</p>
      ) : (
        <>
          <WeightLineChart weights={chrono} fmt={fmt} />
          <div className="mt-4 overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setListOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-slate-50/80"
            >
              <div>
                <p className="text-sm font-semibold text-forest">{t.weight.historyTitle}</p>
                <p className="text-xs text-muted">{t.weight.historyDesc(recent.length)}</p>
              </div>
              <ChevronDown
                size={18}
                className={cn("shrink-0 text-muted transition", listOpen && "rotate-180")}
              />
            </button>
            {listOpen && (
              <ul className="divide-y divide-border border-t border-border">
                {recent.map((w) =>
                  editingId === w.id ? (
                    <li key={w.id} className="p-3">
                      <WeightForm
                        entry={w}
                        submitLabel={t.common.save}
                        onSubmit={(fd) => saveEdit(w.id, fd)}
                        pending={pending}
                        error={error}
                        fieldErr={fieldErr}
                        onCancel={() => {
                          setEditingId(null);
                          setError(null);
                        }}
                      />
                    </li>
                  ) : (
                    <li key={w.id} className="list-none">
                      <button
                        type="button"
                        onClick={() => setExpandedId((id) => (id === w.id ? null : w.id))}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/80"
                      >
                        <span className="text-sm font-semibold text-forest">{w.weightKg} kg</span>
                        <span className="text-xs text-muted">{formatDate(w.measuredAt, fmt)}</span>
                        {w.note && expandedId !== w.id && (
                          <span className="truncate text-xs text-slate-400">{w.note}</span>
                        )}
                        <ChevronDown
                          size={16}
                          className={cn(
                            "ml-auto shrink-0 text-muted transition",
                            expandedId === w.id && "rotate-180",
                          )}
                        />
                      </button>
                      {expandedId === w.id && (
                        <div className="border-t border-border bg-background px-4 py-3">
                          {w.note ? (
                            <p className="text-sm text-slate-600">{w.note}</p>
                          ) : (
                            <p className="text-sm text-muted">{t.weight.noNote}</p>
                          )}
                          {!readOnly && (
                            <div className="mt-3 flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(w.id);
                                  setOpen(false);
                                  setError(null);
                                }}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-600"
                                aria-label={t.common.edit}
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => remove(w.id)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                                aria-label={t.weight.deleteEntry}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
