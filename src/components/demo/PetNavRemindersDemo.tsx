"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { Badge, Card, Tone } from "@/components/ui";
import { PetNavDemoChrome } from "@/components/demo/PetNavDemoChrome";
import { DEMO_REMINDERS } from "@/components/demo/pet-nav-demo-data";
import type { SerializedReminder } from "@/components/RemindersPanel";
import {
  REMINDER_CATEGORY_META,
  type ReminderCategory,
} from "@/lib/constants";
import { formatDate, relativeTime, type FormatOpts } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";
import { cn } from "@/lib/cn";

export function PetNavRemindersDemo() {
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { locale, timeZone };
  const [reminders, setReminders] = useState(DEMO_REMINDERS);

  function toggle(id: string) {
    setReminders((rs) =>
      rs.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
    );
  }

  const open = reminders.filter((r) => !r.completed);
  const done = reminders.filter((r) => r.completed);

  return (
    <PetNavDemoChrome>
      <Card className="p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-forest">{t.remindersPanel.title}</h2>
            <p className="mt-0.5 text-xs text-muted">{t.tabs.remindersDesc}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50"
          >
            <Plus size={13} /> {t.remindersPanel.addReminder}
          </button>
        </div>

        <ReminderSection title={t.remindersPage.upcoming} items={open} fmt={fmt} onToggle={toggle} />
        {done.length > 0 && (
          <ReminderSection title={t.remindersPage.completed} items={done} fmt={fmt} onToggle={toggle} muted />
        )}
      </Card>
    </PetNavDemoChrome>
  );
}

function ReminderSection({
  title,
  items,
  fmt,
  onToggle,
  muted,
}: {
  title: string;
  items: SerializedReminder[];
  fmt: FormatOpts;
  onToggle: (id: string) => void;
  muted?: boolean;
}) {
  const { t } = useI18n();
  if (items.length === 0) return null;

  return (
    <div className={cn("mt-5", muted && "opacity-70")}>
      <p className="text-xs font-semibold uppercase tracking-wider text-sage">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((r) => {
          const cat = REMINDER_CATEGORY_META[r.category as ReminderCategory];
          const overdue = !r.completed && new Date(r.dueAt) < new Date();
          return (
            <li
              key={r.id}
              className="flex items-start gap-3 rounded-xl border border-border p-3"
            >
              <button
                type="button"
                onClick={() => onToggle(r.id)}
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                  r.completed
                    ? "border-emerald-300 bg-emerald-50 text-emerald-600"
                    : "border-border hover:border-brand-300",
                )}
                aria-label={r.completed ? t.remindersPanel.markUndone : t.remindersPanel.markDone}
              >
                {r.completed && <Check size={12} />}
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      r.completed ? "text-muted line-through" : "text-forest",
                    )}
                  >
                    {r.title}
                  </span>
                  <Badge tone={(overdue ? "rose" : "sky") as Tone}>
                    {cat.emoji} {t.reminderCat[r.category as ReminderCategory]}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted">
                  {formatDate(r.dueAt, fmt)} · {relativeTime(r.dueAt)}
                </p>
                {r.notes && <p className="mt-1 text-xs text-slate-500">{r.notes}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
