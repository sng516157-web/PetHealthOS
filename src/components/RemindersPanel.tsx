"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";
import { Card, Badge, Tone } from "@/components/ui";
import { addReminder, toggleReminder } from "@/app/actions";
import {
  REMINDER_CATEGORIES,
  REMINDER_CATEGORY_META,
  ReminderCategory,
} from "@/lib/constants";
import { formatDate, relativeTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
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
  completed: boolean;
  notes: string | null;
};

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100";

export function RemindersPanel({
  petId,
  reminders,
}: {
  petId: string;
  reminders: SerializedReminder[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErr, setFieldErr] = useState<{
    title?: string | null;
    dueAt?: string | null;
  }>({});

  const pendingItems = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  function toggle(id: string) {
    startTransition(async () => {
      await toggleReminder(id);
      router.refresh();
    });
  }

  function add(formData: FormData) {
    setError(null);
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
    if (fe.title || fe.dueAt) return;
    startTransition(async () => {
      const res = await addReminder(petId, formData);
      if (res?.ok) {
        setOpen(false);
        router.refresh();
      } else if (res?.error) {
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

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{t.remindersPanel.title}</h3>
        <button
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
        >
          <Plus size={14} /> {t.common.add}
        </button>
      </div>

      {open && (
        <form action={add} noValidate className="mt-3 space-y-2 rounded-xl border border-border bg-background p-3">
          <div>
            <input name="title" placeholder={t.remindersPanel.titlePlaceholder} className={inputCls} />
            <FieldError code={fieldErr.title} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select name="category" className={inputCls} defaultValue="VACCINE">
              {REMINDER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t.reminderCat[c as ReminderCategory]}
                </option>
              ))}
            </select>
            <div>
              <input name="dueAt" type="date" className={inputCls} />
              <FieldError code={fieldErr.dueAt} />
            </div>
          </div>
          <select name="recurrence" className={inputCls} defaultValue="">
            <option value="">{t.remindersPanel.oneTime}</option>
            <option value="MONTHLY">{t.remindersPanel.monthly}</option>
            <option value="YEARLY">{t.remindersPanel.yearly}</option>
          </select>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {t.remindersPanel.addReminder}
          </button>
        </form>
      )}

      <div className="mt-3 space-y-2">
        {pendingItems.length === 0 && done.length === 0 && (
          <p className="py-3 text-center text-sm text-muted">{t.remindersPanel.noneYet}</p>
        )}
        {pendingItems.map((r) => {
          const meta = REMINDER_CATEGORY_META[r.category as ReminderCategory];
          const overdue = new Date(r.dueAt).getTime() < Date.now();
          return (
            <div key={r.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
              <button
                onClick={() => toggle(r.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-slate-300 text-transparent transition hover:border-brand-500 hover:text-brand-500"
                aria-label={t.remindersPanel.markDone}
              >
                <Check size={13} />
              </button>
              <span className="text-base">{meta?.emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">{r.title}</div>
                <div className="text-xs text-muted">{formatDate(r.dueAt)}</div>
              </div>
              <Badge tone={(overdue ? "rose" : "slate") as Tone}>{relativeTime(r.dueAt)}</Badge>
            </div>
          );
        })}
        {done.map((r) => (
          <div key={r.id} className="flex items-center gap-3 rounded-lg p-2.5 opacity-60">
            <button
              onClick={() => toggle(r.id)}
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-brand-500 text-white"
              aria-label="Mark not done"
            >
              <Check size={13} />
            </button>
            <div className="min-w-0 flex-1 truncate text-sm text-muted line-through">{r.title}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
