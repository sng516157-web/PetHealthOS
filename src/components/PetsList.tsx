"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus, Lightbulb } from "lucide-react";
import { Badge, Card, PetAvatar, EmptyState, Tone } from "@/components/ui";
import { BreederToolsPanel } from "@/components/BreederToolsPanel";
import { SEVERITY_META, Severity } from "@/lib/constants";
import { petAge, relativeTime } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import type { PetStatus } from "@/lib/constants";

type PetItem = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  status: string;
  photoUrl: string | null;
  birthDate: string | null;
  litterName: string | null;
  logCount: number;
  last?: {
    title: string | null;
    rawText: string;
    severity: string;
    occurredAt: string;
  } | null;
};

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "emerald",
  UNDER_OBSERVATION: "amber",
  TRANSFERRED: "violet",
  ARCHIVED: "slate",
};

export function PetsList({
  pets,
  emptyTitle,
  emptyDescription,
  showAddAction = true,
  vaccineTemplates = [],
}: {
  pets: PetItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  showAddAction?: boolean;
  vaccineTemplates?: { id: string; name: string; species: string | null }[];
}) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [species, setSpecies] = useState<"ALL" | "DOG" | "CAT">("ALL");
  const litters = useMemo(() => {
    const names = new Set<string>();
    for (const p of pets) {
      if (p.litterName) names.add(p.litterName);
    }
    return [...names].sort();
  }, [pets]);
  const [litter, setLitter] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return pets.filter((p) => {
      if (species !== "ALL" && p.species !== species) return false;
      if (litter !== "ALL" && p.litterName !== litter) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.breed ?? ""} ${p.litterName ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [pets, q, species, litter]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.pets.searchPlaceholder}
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="flex rounded-xl border border-border bg-surface p-1">
          {(["ALL", "DOG", "CAT"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSpecies(s)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                species === s ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:text-foreground"
              }`}
            >
              {s === "ALL" ? t.species.all : s === "DOG" ? t.species.dogs : t.species.cats}
            </button>
          ))}
        </div>
        {litters.length > 0 && (
          <select
            value={litter}
            onChange={(e) => setLitter(e.target.value)}
            className="rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
          >
            <option value="ALL">{t.litter.allLitters}</option>
            {litters.map((l) => (
              <option key={l} value={l}>
                {t.litter.filterLabel(l)}
              </option>
            ))}
          </select>
        )}
      </div>

      {vaccineTemplates.length > 0 && litters.length === 0 && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-dashed border-brand-200 bg-brand-50/40 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <Lightbulb size={18} className="mt-0.5 shrink-0 text-brand-600" />
            <div>
              <p className="text-sm font-semibold text-forest">{t.vaccineTemplates.tipTitle}</p>
              <p className="mt-1 text-sm text-muted">{t.vaccineTemplates.tipBody}</p>
            </div>
          </div>
          {showAddAction && (
            <Link
              href="/app/pets/new"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:mt-0"
            >
              <Plus size={16} /> {t.vaccineTemplates.addPetCta}
            </Link>
          )}
        </div>
      )}

      {litters.length > 0 && (
        <div className="mt-6">
          <BreederToolsPanel
            templates={vaccineTemplates}
            litters={litters}
            selectedLitter={litter !== "ALL" ? litter : null}
          />
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={emptyTitle ?? t.pets.noPetsFound}
            description={q ? t.pets.tryDifferent : (emptyDescription ?? t.pets.addFirst)}
            action={
              showAddAction ? (
                <Link
                  href="/app/pets/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  <Plus size={16} /> {t.common.addPet}
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/app/pets/${p.id}`}>
              <Card className="h-full p-4 transition hover:shadow-md hover:shadow-slate-200/60">
                <div className="flex items-start gap-3">
                  <PetAvatar species={p.species} name={p.name} photoUrl={p.photoUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-foreground">{p.name}</span>
                      <Badge tone={STATUS_TONE[p.status] ?? "slate"}>
                        {t.statusShort[p.status as PetStatus] ?? p.status}
                      </Badge>
                    </div>
                    <div className="truncate text-xs text-muted">
                      {p.breed || (p.species === "DOG" ? t.species.DOG : t.species.CAT)}
                      {petAge(p.birthDate) ? ` · ${petAge(p.birthDate)}` : ""}
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  {p.last ? (
                    <div className="flex items-center gap-2">
                      <Badge tone={SEVERITY_META[p.last.severity as Severity].color as Tone}>
                        {t.severity[p.last.severity as Severity]}
                      </Badge>
                      <span className="truncate text-xs text-muted">
                        {p.last.title || p.last.rawText}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] text-slate-400">
                        {relativeTime(p.last.occurredAt)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">{t.pets.noEntriesYet}</span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
