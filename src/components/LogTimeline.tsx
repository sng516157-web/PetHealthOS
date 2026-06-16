"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Pencil, Lock } from "lucide-react";
import { Badge, EmptyState, Tone } from "@/components/ui";
import { proxyImageSrc } from "@/lib/img";
import { deleteLogEntry } from "@/app/actions";
import { EditLogEntry } from "@/components/EditLogEntry";
import {
  LOG_TYPE_META,
  SEVERITY_META,
  LogType,
  Severity,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import { useTimezone } from "@/lib/timezone/client";

export type SerializedLog = {
  id: string;
  occurredAt: string;
  rawText: string;
  type: string;
  severity: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  imageUrl?: string | null;
  imageMime?: string | null;
  loggedByName?: string | null;
  lockedAt?: string | null;
};

export function LogTimeline({
  petId,
  logs,
  canDelete = false,
  canEdit = false,
}: {
  petId: string;
  logs: SerializedLog[];
  canDelete?: boolean;
  canEdit?: boolean;
}) {
  const router = useRouter();
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const [filter, setFilter] = useState<string>("ALL");
  const [editing, setEditing] = useState<SerializedLog | null>(null);
  const [, startTransition] = useTransition();

  const types = useMemo(
    () => Array.from(new Set(logs.map((l) => l.type))),
    [logs],
  );
  const filtered =
    filter === "ALL" ? logs : logs.filter((l) => l.type === filter);

  function remove(id: string) {
    if (!confirm(t.timeline.deleteConfirm)) return;
    startTransition(async () => {
      await deleteLogEntry(petId, id);
      router.refresh();
    });
  }

  if (logs.length === 0) {
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
            {t.timeline.all(logs.length)}
          </FilterChip>
          {types.map((ty) => (
            <FilterChip key={ty} active={filter === ty} onClick={() => setFilter(ty)}>
              {LOG_TYPE_META[ty as LogType].emoji} {t.logType[ty as LogType]}
            </FilterChip>
          ))}
        </div>

        <ol className="relative space-y-4 border-l border-border pl-6">
          {filtered.map((l) => {
            const typeMeta = LOG_TYPE_META[l.type as LogType];
            const sevMeta = SEVERITY_META[l.severity as Severity];
            const isLocked = Boolean(l.lockedAt);
            const showEdit = canEdit && !isLocked;
            const showDelete = canDelete && !isLocked;

            return (
              <li key={l.id} className="group relative animate-fade-in">
                <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-surface text-sm ring-1 ring-border">
                  {typeMeta.emoji}
                </span>
                <div className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-foreground">
                          {l.title || t.logType[l.type as LogType]}
                        </span>
                        <Badge tone={typeMeta.color as Tone}>{t.logType[l.type as LogType]}</Badge>
                        {l.severity !== "NONE" && (
                          <Badge tone={sevMeta.color as Tone}>{t.severity[l.severity as Severity]}</Badge>
                        )}
                        {isLocked && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                            <Lock size={10} /> {t.timeline.lockedBadge}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600">{l.rawText}</p>
                      {l.loggedByName && (
                        <span className="mt-1.5 inline-flex items-center rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
                          {t.timeline.loggedBy(l.loggedByName)}
                        </span>
                      )}
                      {l.imageUrl && (
                        <a
                          href={proxyImageSrc(l.imageUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 block w-fit overflow-hidden rounded-xl border border-border"
                        >
                          {l.imageMime?.startsWith("video/") ? (
                            <video
                              src={proxyImageSrc(l.imageUrl)}
                              controls
                              className="max-h-56 w-auto max-w-full"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={proxyImageSrc(l.imageUrl)}
                              alt=""
                              className="max-h-56 w-auto max-w-full object-cover"
                            />
                          )}
                        </a>
                      )}
                      {l.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {l.tags.map((tag) => (
                            <span key={tag} className="text-xs text-slate-400">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {(showEdit || showDelete) && (
                      <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100">
                        {showEdit && (
                          <button
                            type="button"
                            onClick={() => setEditing(l)}
                            className="rounded-lg p-1.5 text-slate-300 hover:bg-brand-50 hover:text-brand-700"
                            aria-label={t.timeline.editEntry}
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {showDelete && (
                          <button
                            type="button"
                            onClick={() => remove(l.id)}
                            className="rounded-lg p-1.5 text-slate-300 hover:bg-rose-50 hover:text-rose-500"
                            aria-label={t.timeline.deleteEntry}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-400">
                    {formatDateTime(l.occurredAt, { timeZone, locale })}
                  </div>
                </div>
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
