"use client";

import Link from "next/link";
import { Activity, ArrowRight, BellRing, PawPrint, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { petAge, relativeTime } from "@/lib/format";
import { Badge, Card, PetAvatar, Tone } from "@/components/ui";
import {
  LOG_TYPE_META,
  REMINDER_CATEGORY_META,
  LogType,
  Severity,
  SEVERITY_META,
} from "@/lib/constants";
import {
  DashboardCanvas,
  DashboardStatCard,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "./DashboardMotion";
import { OrgAiPromoCard } from "@/components/OrgAiPromoCard";

type ShopPet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  status: string;
  photoUrl: string | null;
  logCount: number;
  last: {
    title: string | null;
    rawText: string;
    severity: string;
    type: string;
  } | null;
};

type ShopReminder = {
  id: string;
  petId: string;
  title: string;
  category: string;
  dueAt: string;
  pet: { name: string };
};

export function ShopHomeView({
  orgName,
  pets,
  attention,
  reminders,
  preview,
}: {
  orgName: string;
  pets: ShopPet[];
  attention: ShopPet[];
  reminders: ShopReminder[];
  preview?: { onPetSelect: (petId: string) => void; onOrgAiOpen?: () => void };
}) {
  const { t } = useI18n();
  const now = Date.now();
  const dueSoon = reminders.filter(
    (r) => new Date(r.dueAt).getTime() - now < 1000 * 60 * 60 * 24 * 7,
  );
  const totalLogs = pets.reduce((s, p) => s + p.logCount, 0);

  return (
    <DashboardCanvas className="w-full">
      <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <MotionPop index={0} className="min-w-0">
          <p className="text-sm text-muted">{orgName}</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-forest sm:text-3xl">
            {t.dashboard.overview}
          </h1>
        </MotionPop>
        <MotionPop index={1} className="shrink-0">
          {preview ? (
            <span className="inline-flex w-full cursor-default items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-ps-button sm:w-auto">
              <Plus size={16} /> {t.common.addPet}
            </span>
          ) : (
            <Link
              href="/app/pets/new"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700 sm:w-auto"
            >
              <Plus size={16} /> {t.common.addPet}
            </Link>
          )}
        </MotionPop>
      </header>

      <div className="mt-8 grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          delay={0}
          icon={<PawPrint size={18} />}
          label={t.dashboard.statPets}
          value={pets.length}
          toneClass="bg-brand-50 text-brand-600"
        />
        <DashboardStatCard
          delay={80}
          icon={<Activity size={18} />}
          label={t.dashboard.statAttention}
          value={attention.length}
          toneClass={
            attention.length ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"
          }
        />
        <DashboardStatCard
          delay={160}
          icon={<BellRing size={18} />}
          label={t.dashboard.statDueWeek}
          value={dueSoon.length}
          toneClass={
            dueSoon.length ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
          }
        />
        <DashboardStatCard
          delay={240}
          icon={<Activity size={18} />}
          label={t.dashboard.statLogs}
          value={totalLogs}
          toneClass="bg-sky-50 text-sky-600"
        />
      </div>

      <OrgAiPromoCard
        facility={false}
        petCount={pets.length}
        className="mt-8"
        preview={preview?.onOrgAiOpen ? { onOpen: preview.onOrgAiOpen } : undefined}
      />

      <div className="mt-10 grid w-full min-w-0 max-w-full grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="min-w-0 space-y-6 xl:col-span-8">
          <MotionReveal>
            <h2 className="text-sm font-semibold text-forest">{t.dashboard.needsAttention}</h2>
            <p className="text-xs text-muted">{t.dashboard.needsAttentionSub}</p>
          </MotionReveal>

          {attention.length === 0 ? (
            <MotionReveal delay={80}>
              <Card className="p-6 text-sm text-muted">{t.dashboard.allHealthy}</Card>
            </MotionReveal>
          ) : (
            <div className="space-y-3">
              {attention.map((p, i) => (
                <MotionReveal key={p.id} delay={i * 100}>
                  {preview ? (
                    <button
                      type="button"
                      onClick={() => preview.onPetSelect(p.id)}
                      className={`flex min-w-0 w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-soft sm:gap-4 ${motionCardHover}`}
                    >
                      <div className="shrink-0">
                        <PetAvatar species={p.species} name={p.name} photoUrl={p.photoUrl} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="truncate font-semibold text-forest">{p.name}</span>
                          {p.status === "UNDER_OBSERVATION" && (
                            <Badge tone="amber" dot>
                              {t.statusShort.UNDER_OBSERVATION}
                            </Badge>
                          )}
                        </div>
                        {p.last && (
                          <p className="mt-0.5 truncate text-sm text-muted">
                            {p.last.title || p.last.rawText}
                          </p>
                        )}
                      </div>
                      {p.last && (
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge tone={SEVERITY_META[p.last.severity as Severity].color as Tone}>
                            {t.severity[p.last.severity as Severity]}
                          </Badge>
                          <ArrowRight size={16} className="hidden shrink-0 text-slate-300 sm:block" />
                        </div>
                      )}
                    </button>
                  ) : (
                    <Link href={`/app/pets/${p.id}`}>
                      <div
                        className={`flex min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft sm:gap-4 ${motionCardHover}`}
                      >
                        <div className="shrink-0">
                          <PetAvatar species={p.species} name={p.name} photoUrl={p.photoUrl} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <span className="truncate font-semibold text-forest">{p.name}</span>
                            {p.status === "UNDER_OBSERVATION" && (
                              <Badge tone="amber" dot>
                                {t.statusShort.UNDER_OBSERVATION}
                              </Badge>
                            )}
                          </div>
                          {p.last && (
                            <p className="mt-0.5 truncate text-sm text-muted">
                              {p.last.title || p.last.rawText}
                            </p>
                          )}
                        </div>
                        {p.last && (
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge tone={SEVERITY_META[p.last.severity as Severity].color as Tone}>
                              {t.severity[p.last.severity as Severity]}
                            </Badge>
                            <ArrowRight size={16} className="hidden shrink-0 text-slate-300 sm:block" />
                          </div>
                        )}
                      </div>
                    </Link>
                  )}
                </MotionReveal>
              ))}
            </div>
          )}

          <MotionReveal delay={200}>
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-sm font-semibold text-forest">{t.dashboard.allPets}</h2>
              {!preview && (
                <Link
                  href="/app/pets"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  {t.dashboard.viewAll}
                </Link>
              )}
            </div>
          </MotionReveal>

          <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pets.slice(0, 6).map((p, i) => (
              <MotionReveal key={p.id} delay={240 + i * 60}>
                {preview ? (
                  <button
                    type="button"
                    onClick={() => preview.onPetSelect(p.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 text-left shadow-soft ${motionCardHover}`}
                  >
                    <PetAvatar species={p.species} name={p.name} size="sm" photoUrl={p.photoUrl} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-forest">{p.name}</div>
                      <div className="truncate text-xs text-muted">
                        {p.breed || (p.species === "DOG" ? t.species.DOG : t.species.CAT)}
                        {petAge(p.birthDate) ? ` · ${petAge(p.birthDate)}` : ""}
                      </div>
                    </div>
                    {p.last && (
                      <span
                        className="text-base"
                        title={LOG_TYPE_META[p.last.type as LogType]?.label}
                      >
                        {LOG_TYPE_META[p.last.type as LogType]?.emoji}
                      </span>
                    )}
                  </button>
                ) : (
                  <Link href={`/app/pets/${p.id}`}>
                    <div
                      className={`flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-soft ${motionCardHover}`}
                    >
                      <PetAvatar species={p.species} name={p.name} size="sm" photoUrl={p.photoUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-forest">{p.name}</div>
                        <div className="truncate text-xs text-muted">
                          {p.breed || (p.species === "DOG" ? t.species.DOG : t.species.CAT)}
                          {petAge(p.birthDate) ? ` · ${petAge(p.birthDate)}` : ""}
                        </div>
                      </div>
                      {p.last && (
                        <span
                          className="text-base"
                          title={LOG_TYPE_META[p.last.type as LogType]?.label}
                        >
                          {LOG_TYPE_META[p.last.type as LogType]?.emoji}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
              </MotionReveal>
            ))}
          </div>
        </div>

        <div className="min-w-0 xl:col-span-4">
          <MotionReveal delay={120}>
            <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-forest">
                  {t.dashboard.upcomingReminders}
                </h2>
              </div>
              {reminders.length === 0 ? (
                <p className="p-6 text-sm text-muted">{t.dashboard.noReminders}</p>
              ) : (
                <ul className="divide-y divide-border">
                  {reminders.slice(0, 8).map((r) => {
                    const meta =
                      REMINDER_CATEGORY_META[
                        r.category as keyof typeof REMINDER_CATEGORY_META
                      ];
                    const overdue = new Date(r.dueAt).getTime() < now;
                    return (
                      <li key={r.id}>
                        {preview ? (
                          <button
                            type="button"
                            onClick={() => preview.onPetSelect(r.petId)}
                            className="flex min-w-0 w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-brand-50/30"
                          >
                            <span className="shrink-0 text-lg">{meta?.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-foreground">
                                {r.title}
                              </div>
                              <div className="truncate text-xs text-muted">{r.pet.name}</div>
                            </div>
                            <Badge tone={overdue ? "rose" : "slate"} className="shrink-0">
                              {relativeTime(r.dueAt)}
                            </Badge>
                          </button>
                        ) : (
                          <Link
                            href={`/app/pets/${r.petId}`}
                            className="flex min-w-0 items-center gap-3 px-4 py-3.5 transition hover:bg-brand-50/30"
                          >
                            <span className="shrink-0 text-lg">{meta?.emoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium text-foreground">
                                {r.title}
                              </div>
                              <div className="truncate text-xs text-muted">{r.pet.name}</div>
                            </div>
                            <Badge tone={overdue ? "rose" : "slate"} className="shrink-0">
                              {relativeTime(r.dueAt)}
                            </Badge>
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </MotionReveal>
        </div>
      </div>
    </DashboardCanvas>
  );
}
