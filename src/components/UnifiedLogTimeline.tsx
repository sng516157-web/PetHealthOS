"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Lock } from "lucide-react";
import { Badge, EmptyState, Card, type Tone } from "@/components/ui";
import { proxyImageSrc } from "@/lib/img";
import {
  deleteLogEntry,
  deleteFoodLogEntry,
  deleteActivityLogEntry,
  deleteMedicationLogEntry,
} from "@/app/actions";
import { EditLogEntry } from "@/components/EditLogEntry";
import {
  LOG_TYPE_META,
  SEVERITY_META,
  LOG_BUCKET_META,
  type LogType,
  type Severity,
  type LogBucket,
  type MealType,
  type AppetiteLevel,
  type ActivityType,
  type ActivityIntensity,
  type MedicationRoute,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";
import type { SerializedLog } from "@/components/LogTimeline";
import type { SerializedFoodLog } from "@/components/FoodLogPanel";
import type { SerializedActivityLog } from "@/components/ActivityLogPanel";
import type { SerializedMedicationLog } from "@/components/MedicationLogPanel";
import type { UnifiedLogItem } from "@/lib/unified-logs";

export function UnifiedLogTimeline({
  petId,
  items,
  canDelete = false,
  canEdit = false,
}: {
  petId: string;
  items: UnifiedLogItem[];
  canDelete?: boolean;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { locale, timeZone };
  const [filter, setFilter] = useState<"ALL" | LogBucket>("ALL");
  const [editing, setEditing] = useState<SerializedLog | null>(null);
  const [, startTransition] = useTransition();

  const counts = useMemo(() => {
    const c: Record<LogBucket, number> = { health: 0, food: 0, activity: 0, medication: 0 };
    for (const item of items) c[item.kind] += 1;
    return c;
  }, [items]);

  const filtered =
    filter === "ALL" ? items : items.filter((i) => i.kind === filter);

  function remove(item: UnifiedLogItem) {
    if (!confirm(t.timeline.deleteConfirm)) return;
    startTransition(async () => {
      if (item.kind === "health") await deleteLogEntry(petId, item.id);
      else if (item.kind === "food") await deleteFoodLogEntry(petId, item.id);
      else if (item.kind === "activity") await deleteActivityLogEntry(petId, item.id);
      else await deleteMedicationLogEntry(petId, item.id);
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={t.timeline.noEntries}
        description={t.timeline.noEntriesDesc}
      />
    );
  }

  return (
    <>
      <div>
        <div className="mb-4 flex flex-wrap gap-1.5">
          <FilterChip active={filter === "ALL"} onClick={() => setFilter("ALL")}>
            {t.timeline.all(items.length)}
          </FilterChip>
          {(Object.keys(counts) as LogBucket[])
            .filter((k) => counts[k] > 0)
            .map((bucket) => {
              const meta = LOG_BUCKET_META[bucket];
              return (
                <FilterChip
                  key={bucket}
                  active={filter === bucket}
                  onClick={() => setFilter(bucket)}
                >
                  {meta.emoji} {t.logBucket[bucket]} ({counts[bucket]})
                </FilterChip>
              );
            })}
        </div>

        <ol className="relative space-y-4 border-l border-border pl-6">
          {filtered.map((item) => {
            const bucketMeta = LOG_BUCKET_META[item.kind];
            const isLocked = Boolean(item.lockedAt);
            const showEdit = canEdit && item.kind === "health" && !isLocked;
            const showDelete = canDelete && !isLocked;

            return (
              <li key={`${item.kind}-${item.id}`} className="group relative animate-fade-in">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-surface text-sm ring-1 ring-border">
                  {bucketMeta.emoji}
                </span>
                <Card className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {item.kind === "health" && (
                        <HealthBody item={item} t={t} />
                      )}
                      {item.kind === "food" && <FoodBody item={item} t={t} />}
                      {item.kind === "activity" && <ActivityBody item={item} t={t} />}
                      {item.kind === "medication" && <MedicationBody item={item} t={t} />}
                    </div>
                    {(showEdit || showDelete) && (
                      <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
                        {showEdit && (
                          <button
                            type="button"
                            onClick={() => setEditing(item)}
                            className="rounded-lg p-1.5 text-slate-300 hover:bg-brand-50 hover:text-brand-700"
                            aria-label={t.timeline.editEntry}
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {showDelete && (
                          <button
                            type="button"
                            onClick={() => remove(item)}
                            className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                            aria-label={t.timeline.deleteEntry}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <Badge tone={bucketMeta.color as Tone}>{t.logBucket[item.kind]}</Badge>
                    {isLocked && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        <Lock size={10} /> {t.timeline.lockedBadge}
                      </span>
                    )}
                    <span>{formatDateTime(item.occurredAt, fmt)}</span>
                  </div>
                </Card>
              </li>
            );
          })}
        </ol>
      </div>

      {editing && (
        <EditLogEntry petId={petId} entry={editing} onClose={() => setEditing(null)} />
      )}
    </>
  );
}

function HealthBody({
  item,
  t,
}: {
  item: Extract<UnifiedLogItem, { kind: "health" }>;
  t: ReturnType<typeof useI18n>["t"];
  onEdit?: () => void;
}) {
  const typeMeta = LOG_TYPE_META[item.type as LogType];
  const sevMeta = SEVERITY_META[item.severity as Severity];
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">
          {item.title || t.logType[item.type as LogType]}
        </span>
        <Badge tone={typeMeta.color as Tone}>{t.logType[item.type as LogType]}</Badge>
        {item.severity !== "NONE" && (
          <Badge tone={sevMeta.color as Tone}>{t.severity[item.severity as Severity]}</Badge>
        )}
      </div>
      <p className="mt-1.5 text-sm text-slate-600">{item.rawText}</p>
      {item.loggedByName && (
        <span className="mt-1.5 inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
          {t.timeline.loggedBy(item.loggedByName)}
        </span>
      )}
      {item.imageUrl && (
        <a
          href={proxyImageSrc(item.imageUrl)}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block w-fit overflow-hidden rounded-xl border border-border"
        >
          {item.imageMime?.startsWith("video/") ? (
            <video
              src={proxyImageSrc(item.imageUrl)}
              controls
              className="max-h-56 w-auto max-w-full"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxyImageSrc(item.imageUrl)}
              alt=""
              className="max-h-56 w-auto max-w-full object-cover"
            />
          )}
        </a>
      )}
      {item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span key={tag} className="text-xs text-slate-400">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function FoodBody({
  item,
  t,
}: {
  item: Extract<UnifiedLogItem, { kind: "food" }>;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">{item.foodName}</span>
        <Badge tone="amber">{t.mealType[item.mealType as MealType]}</Badge>
        <Badge tone={appetiteTone(item.appetite)}>
          {t.appetiteLevel[item.appetite as AppetiteLevel]}
        </Badge>
      </div>
      {item.amount && <p className="mt-1 text-sm text-slate-600">{item.amount}</p>}
      {item.notes && <p className="mt-1 text-sm text-slate-500">{item.notes}</p>}
    </>
  );
}

function ActivityBody({
  item,
  t,
}: {
  item: Extract<UnifiedLogItem, { kind: "activity" }>;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">
          {t.activityType[item.activityType as ActivityType]}
        </span>
        {item.durationMin != null && <Badge tone="brand">{item.durationMin} min</Badge>}
        <Badge tone={intensityTone(item.intensity)}>
          {t.activityIntensity[item.intensity as ActivityIntensity]}
        </Badge>
      </div>
      {item.distanceKm != null && (
        <p className="mt-1 text-sm text-slate-600">{item.distanceKm} km</p>
      )}
      {item.notes && <p className="mt-1 text-sm text-slate-500">{item.notes}</p>}
    </>
  );
}

function MedicationBody({
  item,
  t,
}: {
  item: Extract<UnifiedLogItem, { kind: "medication" }>;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">{item.medicationName}</span>
        <Badge tone="violet">{t.medicationRoute[item.route as MedicationRoute]}</Badge>
        {item.dose && <Badge tone="slate">{item.dose}</Badge>}
      </div>
      {item.notes && item.notes !== item.medicationName && (
        <p className="mt-1 text-sm text-slate-500">{item.notes}</p>
      )}
    </>
  );
}

function appetiteTone(appetite: string): Tone {
  if (appetite === "REFUSED" || appetite === "DECREASED") return "amber";
  if (appetite === "INCREASED") return "emerald";
  return "sky";
}

function intensityTone(intensity: string): Tone {
  if (intensity === "VIGOROUS") return "rose";
  if (intensity === "MODERATE") return "amber";
  return "sky";
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? "bg-brand-600 text-white"
          : "border border-border bg-surface text-slate-500 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

export type { SerializedFoodLog, SerializedActivityLog, SerializedMedicationLog };
