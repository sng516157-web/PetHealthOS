"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Badge, EmptyState, Tone } from "@/components/ui";
import { deleteLogEntry } from "@/app/actions";
import {
  LOG_TYPE_META,
  SEVERITY_META,
  LogType,
  Severity,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/format";

export type SerializedLog = {
  id: string;
  occurredAt: string;
  rawText: string;
  type: string;
  severity: string;
  title: string | null;
  summary: string | null;
  tags: string[];
};

export function LogTimeline({
  petId,
  logs,
}: {
  petId: string;
  logs: SerializedLog[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<string>("ALL");
  const [, startTransition] = useTransition();

  const types = useMemo(
    () => Array.from(new Set(logs.map((l) => l.type))),
    [logs],
  );
  const filtered =
    filter === "ALL" ? logs : logs.filter((l) => l.type === filter);

  function remove(id: string) {
    startTransition(async () => {
      await deleteLogEntry(petId, id);
      router.refresh();
    });
  }

  if (logs.length === 0) {
    return (
      <EmptyState
        title="No log entries yet"
        description="Add your first note above. The AI will categorize it and build this pet's health timeline."
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-1.5">
        <FilterChip active={filter === "ALL"} onClick={() => setFilter("ALL")}>
          All ({logs.length})
        </FilterChip>
        {types.map((t) => (
          <FilterChip key={t} active={filter === t} onClick={() => setFilter(t)}>
            {LOG_TYPE_META[t as LogType].emoji} {LOG_TYPE_META[t as LogType].label}
          </FilterChip>
        ))}
      </div>

      <ol className="relative space-y-4 border-l border-border pl-6">
        {filtered.map((l) => {
          const typeMeta = LOG_TYPE_META[l.type as LogType];
          const sevMeta = SEVERITY_META[l.severity as Severity];
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
                        {l.title || typeMeta.label}
                      </span>
                      <Badge tone={typeMeta.color as Tone}>{typeMeta.label}</Badge>
                      {l.severity !== "NONE" && (
                        <Badge tone={sevMeta.color as Tone}>{sevMeta.label}</Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-slate-600">{l.rawText}</p>
                    {l.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {l.tags.map((t) => (
                          <span key={t} className="text-xs text-slate-400">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => remove(l.id)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-500 group-hover:opacity-100"
                    aria-label="Delete entry"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-slate-400">
                  {formatDateTime(l.occurredAt)}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
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
