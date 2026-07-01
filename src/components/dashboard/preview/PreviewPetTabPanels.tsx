"use client";

import { useMemo, useState } from "react";
import {
  ChevronDown,
  FileText,
  Hospital,
  Plus,
  QrCode,
  Scale,
  Send,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { Card, Badge, type Tone } from "@/components/ui";
import { LogTimeline } from "@/components/LogTimeline";
import { WeightLineChart } from "@/components/WeightLineChart";
import {
  INITIAL_HEALTH,
  INITIAL_FOOD,
  INITIAL_ACTIVITY,
} from "@/components/demo/pet-log-demo-data";
import { DEMO_REMINDERS, DEMO_WEIGHTS, DEMO_ATTACHMENTS } from "@/components/demo/pet-nav-demo-data";
import {
  ATTACHMENT_KINDS,
  ATTACHMENT_KIND_META,
  REMINDER_CATEGORY_META,
  type AttachmentKind,
  type ReminderCategory,
  type MealType,
  type AppetiteLevel,
} from "@/lib/constants";
import { formatDate, formatDateTime, relativeTime, type FormatOpts } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";
import { cn } from "@/lib/cn";
import type { PetLogSubTabId, PetMainTabId } from "@/components/pet-tab-model";
import type { PreviewPetRecord } from "@/lib/dashboard-preview-data";

type Role = "owner" | "shop" | "facility";

/** Tab panel bodies for landing preview — update when pet tab UIs change materially. */
export function PreviewPetTabPanels({
  role,
  pet,
  mainTab,
  logSubTab,
}: {
  role: Role;
  pet: PreviewPetRecord;
  mainTab: PetMainTabId;
  logSubTab: PetLogSubTabId;
}) {
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { locale, timeZone };

  if (mainTab === "logs" && logSubTab === "quick") {
    return (
      <div className="space-y-4">
        <Card className="border-dashed border-brand-200 bg-brand-50/40 p-3 text-xs text-brand-900">
          {t.quickLog.aiStructures}
        </Card>
        <LogTimeline petId="preview" logs={INITIAL_HEALTH} canEdit={false} canDelete={false} />
      </div>
    );
  }

  if (mainTab === "logs" && logSubTab === "food") {
    return <PreviewFoodPanel fmt={fmt} />;
  }

  if (mainTab === "logs" && logSubTab === "activity") {
    return <PreviewActivityPanel fmt={fmt} />;
  }

  if (mainTab === "chat") {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-forest">{t.tabs.aiAssistant}</h2>
        </div>
        <p className="mt-2 text-sm text-muted">{t.chat.askDesc(pet.name)}</p>
        <div className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-900">
          {role === "owner" ? t.chat.ownerStarters[0] : t.chat.shopStarters[0]}
        </div>
      </Card>
    );
  }

  if (mainTab === "triage") {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Stethoscope size={16} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-forest">{t.tabs.triage}</h2>
        </div>
        <p className="mt-2 text-sm text-muted">{t.triage.subtitle(pet.name)}</p>
        <Badge tone="sky" className="mt-3">
          {t.urgency.MONITOR.label}
        </Badge>
        <p className="mt-2 text-sm text-slate-600">{t.triage.noneDesc(pet.name)}</p>
      </Card>
    );
  }

  if (mainTab === "reminders") {
    return <PreviewRemindersPanel fmt={fmt} />;
  }

  if (mainTab === "weight") {
    return <PreviewWeightPanel fmt={fmt} />;
  }

  if (mainTab === "documents") {
    return <PreviewDocumentsPanel />;
  }

  if (mainTab === "checkin" && role === "owner") {
    return <PreviewCheckinPanel />;
  }

  if (mainTab === "transfer" && role === "shop") {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Send size={16} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-forest">{t.tabs.transfer}</h2>
        </div>
        <p className="mt-2 text-sm text-muted">{t.transferPage.subtitle(pet.name)}</p>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <QrCode size={16} /> {t.transferForm.create}
        </button>
      </Card>
    );
  }

  return null;
}

function PreviewFoodPanel({ fmt }: { fmt: FormatOpts }) {
  const { t } = useI18n();
  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-forest">{t.foodLog.title}</h2>
      <p className="mt-0.5 text-xs text-muted">{t.foodLog.subtitle}</p>
      <ul className="mt-4 space-y-3">
        {INITIAL_FOOD.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-forest">{entry.foodName}</span>
              <Badge tone="sky">{t.mealType[entry.mealType as MealType]}</Badge>
              <Badge tone="amber">{t.appetiteLevel[entry.appetite as AppetiteLevel]}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">
              {entry.portion} · {formatDateTime(entry.occurredAt, fmt)}
            </p>
            {entry.notes && <p className="mt-1 text-sm text-slate-600">{entry.notes}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PreviewActivityPanel({ fmt }: { fmt: FormatOpts }) {
  const { t } = useI18n();
  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-forest">{t.activityLog.title}</h2>
      <p className="mt-0.5 text-xs text-muted">{t.activityLog.subtitle}</p>
      <ul className="mt-4 space-y-3">
        {INITIAL_ACTIVITY.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-forest">
                {t.activityType[entry.activityType as keyof typeof t.activityType] ??
                  entry.activityType}
              </span>
              <Badge tone="brand">{entry.durationMin} min</Badge>
            </div>
            <p className="mt-1 text-xs text-muted">{formatDateTime(entry.occurredAt, fmt)}</p>
            {entry.notes && <p className="mt-1 text-sm text-slate-600">{entry.notes}</p>}
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PreviewRemindersPanel({ fmt }: { fmt: FormatOpts }) {
  const { t } = useI18n();
  const [reminders, setReminders] = useState(DEMO_REMINDERS);
  const open = reminders.filter((r) => !r.completed);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-forest">{t.remindersPanel.title}</h2>
          <p className="mt-0.5 text-xs text-muted">{t.tabs.remindersDesc}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-brand-700">
          <Plus size={13} /> {t.remindersPanel.addReminder}
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {open.map((r) => {
          const cat = REMINDER_CATEGORY_META[r.category as ReminderCategory];
          const overdue = new Date(r.dueAt) < new Date();
          return (
            <li key={r.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
              <button
                type="button"
                onClick={() =>
                  setReminders((rs) =>
                    rs.map((x) => (x.id === r.id ? { ...x, completed: !x.completed } : x)),
                  )
                }
                className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border hover:border-brand-300"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-forest">{r.title}</span>
                  <Badge tone={(overdue ? "rose" : "sky") as Tone}>{cat?.emoji} {cat?.label}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted">
                  {t.notifications.due} {formatDate(r.dueAt, fmt)} · {relativeTime(r.dueAt)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function PreviewWeightPanel({ fmt }: { fmt: FormatOpts }) {
  const { t } = useI18n();
  const [listOpen, setListOpen] = useState(false);
  const chrono = useMemo(
    () => [...DEMO_WEIGHTS].sort((a, b) => a.measuredAt.localeCompare(b.measuredAt)),
    [],
  );
  const latest = chrono[chrono.length - 1];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Scale size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-forest">{t.weight.title}</h2>
      </div>
      {latest && (
        <p className="mt-2 text-2xl font-bold text-forest">
          {latest.weightKg} kg
          <span className="ml-2 text-sm font-normal text-muted">
            · {formatDate(latest.measuredAt, fmt)}
          </span>
        </p>
      )}
      <div className="mt-4">
        <WeightLineChart weights={chrono} fmt={fmt} />
      </div>
      <button
        type="button"
        onClick={() => setListOpen((v) => !v)}
        className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-700"
      >
        <ChevronDown size={14} className={cn("transition", listOpen && "rotate-180")} />
        {t.weight.historyTitle}
      </button>
      {listOpen && (
        <ul className="mt-2 space-y-2 border-t border-border pt-2">
          {[...chrono].reverse().map((w) => (
            <li key={w.id} className="flex justify-between text-xs text-slate-600">
              <span>{formatDate(w.measuredAt, fmt)}</span>
              <span className="font-medium text-forest">{w.weightKg} kg</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function PreviewDocumentsPanel() {
  const { t } = useI18n();
  const [category, setCategory] = useState<"ALL" | AttachmentKind>("ALL");
  const filtered =
    category === "ALL" ? DEMO_ATTACHMENTS : DEMO_ATTACHMENTS.filter((a) => a.kind === category);

  return (
    <Card className="p-4">
      <h2 className="text-sm font-semibold text-forest">{t.documents.title}</h2>
      <div className="mt-3 flex gap-1 overflow-x-auto border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setCategory("ALL")}
          className={cn(
            "shrink-0 px-2 py-1 text-xs font-medium",
            category === "ALL" ? "text-brand-700" : "text-muted",
          )}
        >
          {t.documents.allCategories}
        </button>
        {ATTACHMENT_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setCategory(k)}
            className={cn(
              "shrink-0 px-2 py-1 text-xs font-medium",
              category === k ? "text-brand-700" : "text-muted",
            )}
          >
            {ATTACHMENT_KIND_META[k].label}
          </button>
        ))}
      </div>
      <ul className="mt-3 space-y-2">
        {filtered.map((a) => (
          <li
            key={a.id}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <FileText size={14} className="text-brand-600" />
            <span className="min-w-0 flex-1 truncate text-forest">{a.label}</span>
            <span className="text-[10px] uppercase text-muted">
              {a.mimeType?.split("/")[1] ?? "file"}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PreviewCheckinPanel() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2">
        <Hospital size={16} className="text-brand-600" />
        <h2 className="text-sm font-semibold text-forest">{t.me.checkinTitle}</h2>
      </div>
      <p className="mt-2 text-sm text-muted">{t.me.checkinDesc}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white"
      >
        <QrCode size={16} /> {open ? t.me.hideQr : t.me.showQr}
      </button>
      {open && (
        <div className="mt-4 grid h-32 w-32 place-items-center rounded-2xl border-2 border-dashed border-brand-300 bg-white">
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 25 }).map((_, i) => (
              <span
                key={i}
                className={cn("h-2 w-2", i % 3 === 0 ? "bg-forest" : "bg-slate-200")}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
