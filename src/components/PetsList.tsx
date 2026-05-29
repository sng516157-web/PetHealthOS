"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { Badge, Card, PetAvatar, EmptyState, Tone } from "@/components/ui";
import { SEVERITY_META, Severity } from "@/lib/constants";
import { petAge, relativeTime } from "@/lib/format";

type PetItem = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  status: string;
  photoUrl: string | null;
  birthDate: string | null;
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

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  UNDER_OBSERVATION: "Observation",
  TRANSFERRED: "Transferred",
  ARCHIVED: "Archived",
};

export function PetsList({ pets }: { pets: PetItem[] }) {
  const [q, setQ] = useState("");
  const [species, setSpecies] = useState<"ALL" | "DOG" | "CAT">("ALL");

  const filtered = useMemo(() => {
    return pets.filter((p) => {
      if (species !== "ALL" && p.species !== species) return false;
      if (!q) return true;
      const hay = `${p.name} ${p.breed ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [pets, q, species]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or breed…"
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
              {s === "ALL" ? "All" : s === "DOG" ? "Dogs" : "Cats"}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No pets found"
            description={q ? "Try a different search." : "Add your first pet to get started."}
            action={
              <Link
                href="/pets/new"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                <Plus size={16} /> Add pet
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/pets/${p.id}`}>
              <Card className="h-full p-4 transition hover:shadow-md hover:shadow-slate-200/60">
                <div className="flex items-start gap-3">
                  <PetAvatar species={p.species} name={p.name} photoUrl={p.photoUrl} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-foreground">{p.name}</span>
                      <Badge tone={STATUS_TONE[p.status] ?? "slate"}>
                        {STATUS_LABEL[p.status] ?? p.status}
                      </Badge>
                    </div>
                    <div className="truncate text-xs text-muted">
                      {p.breed || (p.species === "DOG" ? "Dog" : "Cat")}
                      {petAge(p.birthDate) ? ` · ${petAge(p.birthDate)}` : ""}
                    </div>
                  </div>
                </div>
                <div className="mt-3 border-t border-border pt-3">
                  {p.last ? (
                    <div className="flex items-center gap-2">
                      <Badge tone={SEVERITY_META[p.last.severity as Severity].color as Tone}>
                        {SEVERITY_META[p.last.severity as Severity].label}
                      </Badge>
                      <span className="truncate text-xs text-muted">
                        {p.last.title || p.last.rawText}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] text-slate-400">
                        {relativeTime(p.last.occurredAt)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted">No entries yet</span>
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
