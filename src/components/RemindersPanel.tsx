"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Pencil, Trash2 } from "lucide-react";
import { Card, Badge, Tone } from "@/components/ui";
import {
  addReminder,
  toggleReminder,
  updateReminder,
  deleteReminder,
} from "@/app/actions";
import {
  REMINDER_CATEGORIES,
  REMINDER_CATEGORY_META,
  ReminderCategory,
} from "@/lib/constants";
import { formatDate, relativeTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";
import { FieldError } from "@/components/FieldError";
import {
  validateRequiredName,
  validateDate,
  validationMessage,
  VErr,
} from "@/lib/validation";

export type SerializedReminder = {
  id: string;
  title: string;
  category: string;
  dueAt: string;
  recurrence: string | null;
  completed: boolean;
  notes: string | null;
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

function ReminderForm({
  reminder,
  submitLabel,
  onCancel,
  onSubmit,
  pending,
  error,
  fieldErr,
}: {
  reminder?: SerializedReminder;
  submitLabel: string;
  onCancel?: () => void;
  onSubmit: (formData: FormData) => void;
  pending: boolean;
  error: string | null;
  fieldErr: { title?: string | null; dueAt?: string | null };
}) {
  const { t } = useI18n();

  return (
    <form action={onSubmit} noValidate className="space-y-2 rounded-xl border border-border bg-background p-3">
      <div>
        <input
          name="title"
          defaultValue={reminder?.title}
          placeholder={t.remindersPanel.titlePlaceholder}
          className={inputCls}
        />
        <FieldError code={fieldErr.title} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select name="category" className={inputCls} defaultValue={reminder?.category ?? "VACCINE"}>
          {REMINDER_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {t.reminderCat[c as ReminderCategory]}
            </option>
          ))}
        </select>
        <div>
          <input
            name="dueAt"
            type="date"
            defaultValue={reminder ? toDateInput(reminder.dueAt) : undefined}
            className={inputCls}
          />
          <FieldError code={fieldErr.dueAt} />
        </div>
      </div>
      <select
        name="recurrence"
        className={inputCls}
        defaultValue={reminder?.recurrence ?? ""}
      >
        <option value="">{t.remindersPanel.oneTime}</option>
        <option value="MONTHLY">{t.remindersPanel.monthly}</option>
        <option value="YEARLY">{t.remindersPanel.yearly}</option>
      </select>
      <input
        name="notes"
        defaultValue={reminder?.notes ?? ""}
        placeholder={t.remindersPanel.notesPlaceholder}
        className={inputCls}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <div className="flex gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            {t.common.cancel}
          </button>
        )}
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function RemindersPanel({
  petId,
  reminders,
  readOnly = false,
}: {
  petId: string;
  reminders: SerializedReminder[];
  readOnly?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { timeZone, locale };
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{
    title?: string | null;
    dueAt?: string | null;
  }>({});

  const pendingItems = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  function validateForm(formData: FormData) {
    const fe = {
      title: validateRequiredName(
        String(formData.get("title") || ""),
        VErr.TITLE_REQUIRED,
        120,
        VErr.TITLE_TOO_LONG,
      ),
      dueAt: validateDate(String(formData.get("dueAt") || ""), true),
    };
    setFieldErr(fe);
    return !(fe.title || fe.dueAt);
  }

  function toggle(id: string) {
    if (readOnly) return;
    startTransition(async () => {
      await toggleReminder(id);
      router.refresh();
    });
  }

  function add(formData: FormData) {
    setError(null);
    if (!validateForm(formData)) return;
    startTransition(async () => {
      const res = await addReminder(petId, formData);
      if (res && "ok" in res && res.ok) {
        setOpen(false);
        router.refresh();
      } else if (res && "error" in res) {
        setError(
          validationMessage(
            t.validation as unknown as Record<string, string>,
            res.error,
            res.error,
          ),
        );
      }
    });
  }

  function saveEdit(id: string, formData: FormData) {
    setError(null);
    if (!validateForm(formData)) return;
    startTransition(async () => {
      const res = await updateReminder(id, formData);
      if (res && "ok" in res && res.ok) {
        setEditingId(null);
        router.refresh();
      } else if (res && "error" in res) {
        setError(
          validationMessage(
            t.validation as unknown as Record<string, string>,
            res.error,
            res.error,
          ),
        );
      }
    });
  }

  function remove(id: string) {
    if (!confirm(t.remindersPanel.deleteConfirm)) return;
    startTransition(async () => {
      await deleteReminder(id);
      if (editingId === id) setEditingId(null);
      router.refresh();
    });
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t.remindersPanel.title}</h3>
        {!readOnly && (
          <button
            onClick={() => {
              setOpen((o) => !o);
              setEditingId(null);
            }}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <Plus size={14} /> {t.common.add}
          </button>
        )}
      </div>

      {open && !readOnly && (
        <div className="mt-3">
          <ReminderForm
            submitLabel={t.remindersPanel.addReminder}
            onSubmit={add}
            pending={pending}
            error={error}
            fieldErr={fieldErr}
            onCancel={() => setOpen(false)}
          />
        </div>
      )}

      <div className="mt-3 space-y-2">
        {pendingItems.length === 0 && done.length === 0 && (
          <p className="py-3 text-center text-sm text-muted">{t.remindersPanel.noneYet}</p>
        )}
        {pendingItems.map((r) => {
          if (editingId === r.id) {
            return (
              <div key={r.id}>
                <ReminderForm
                  reminder={r}
                  submitLabel={t.remindersPanel.saveReminder}
                  onSubmit={(fd) => saveEdit(r.id, fd)}
                  pending={pending}
                  error={error}
                  fieldErr={fieldErr}
                  onCancel={() => {
                    setEditingId(null);
                    setError(null);
                  }}
                />
              </div>
            );
          }
          const meta = REMINDER_CATEGORY_META[r.category as ReminderCategory];
          const overdue = new Date(r.dueAt).getTime() < Date.now();
          return (
            <div key={r.id} className="flex items-center gap-2 rounded-lg border border-border p-2.5">
              {!readOnly && (
                <button
                  onClick={() => toggle(r.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 text-transparent transition hover:border-brand-500 hover:text-brand-500"
                  aria-label={t.remindersPanel.markDone}
                >
                  <Check size={13} />
                </button>
              )}
              <span className="text-base">{meta?.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{r.title}</div>
                <div className="text-xs text-muted">{formatDate(r.dueAt, fmt)}</div>
              </div>
              <Badge tone={(overdue ? "rose" : "slate") as Tone}>{relativeTime(r.dueAt)}</Badge>
              {!readOnly && (
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    onClick={() => {
                      setEditingId(r.id);
                      setOpen(false);
                      setError(null);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-600"
                    aria-label={t.common.edit}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    aria-label={t.common.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {done.map((r) => {
          if (editingId === r.id) {
            return (
              <div key={r.id}>
                <ReminderForm
                  reminder={r}
                  submitLabel={t.remindersPanel.saveReminder}
                  onSubmit={(fd) => saveEdit(r.id, fd)}
                  pending={pending}
                  error={error}
                  fieldErr={fieldErr}
                  onCancel={() => {
                    setEditingId(null);
                    setError(null);
                  }}
                />
              </div>
            );
          }
          return (
            <div key={r.id} className="flex items-center gap-2 rounded-lg p-2.5 opacity-60">
              {!readOnly && (
                <button
                  onClick={() => toggle(r.id)}
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white"
                  aria-label={t.remindersPanel.markUndone}
                >
                  <Check size={13} />
                </button>
              )}
              <div className="min-w-0 flex-1 truncate text-sm text-muted line-through">{r.title}</div>
              {!readOnly && (
                <div className="flex shrink-0 items-center gap-0.5">
                  <button
                    onClick={() => {
                      setEditingId(r.id);
                      setOpen(false);
                      setError(null);
                    }}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-brand-600"
                    aria-label={t.common.edit}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => remove(r.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                    aria-label={t.common.delete}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
