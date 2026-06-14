import Link from "next/link";
import { PawPrint, BellRing, Activity, Plus, ArrowRight } from "lucide-react";
import {
  getActivePetsWithStats,
  getUpcomingReminders,
  requireActiveOrg,
  isFacilityOrg,
  getFacilityPets,
} from "@/lib/data";
import { AdmitScanner } from "@/components/AdmitScanner";
import { PetsList } from "@/components/PetsList";
import { Badge, Card, PetAvatar, SectionTitle, Tone } from "@/components/ui";
import {
  LOG_TYPE_META,
  SEVERITY_META,
  REMINDER_CATEGORY_META,
  LogType,
  Severity,
} from "@/lib/constants";
import { petAge, relativeTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { EmailVerifiedBanner } from "@/components/EmailVerifiedBanner";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const org = await requireActiveOrg();
  const params = await searchParams;
  const showVerified = params.verified === "1";
  if (isFacilityOrg(org)) return <FacilityDashboard orgName={org.name} verified={showVerified} />;

  const [{ t }, pets, reminders] = await Promise.all([
    getI18n(),
    getActivePetsWithStats(),
    getUpcomingReminders(),
  ]);

  const now = Date.now();
  const twoWeeks = 1000 * 60 * 60 * 24 * 14;
  const attention = pets.filter((p) => {
    const last = p.logs[0];
    const recent = last && now - last.occurredAt.getTime() < twoWeeks;
    const sev = last ? SEVERITY_META[last.severity as Severity].rank : 0;
    return p.status === "UNDER_OBSERVATION" || (recent && sev >= 3);
  });

  const dueSoon = reminders.filter(
    (r) => r.dueAt.getTime() - now < 1000 * 60 * 60 * 24 * 7,
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      {showVerified && (
        <div className="mb-6">
          <EmailVerifiedBanner message={t.verifyEmail.confirmedBanner} />
        </div>
      )}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{org.name}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {t.dashboard.overview}
          </h1>
        </div>
        <Link
          href="/app/pets/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={16} /> {t.common.addPet}
        </Link>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<PawPrint size={18} />} label={t.dashboard.statPets} value={pets.length} tone="brand" />
        <StatCard
          icon={<Activity size={18} />}
          label={t.dashboard.statAttention}
          value={attention.length}
          tone={attention.length ? "orange" : "emerald"}
        />
        <StatCard
          icon={<BellRing size={18} />}
          label={t.dashboard.statDueWeek}
          value={dueSoon.length}
          tone={dueSoon.length ? "amber" : "emerald"}
        />
        <StatCard
          icon={<Activity size={18} />}
          label={t.dashboard.statLogs}
          value={pets.reduce((s, p) => s + p._count.logs, 0)}
          tone="sky"
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <SectionTitle
            title={t.dashboard.needsAttention}
            subtitle={t.dashboard.needsAttentionSub}
          />
          {attention.length === 0 ? (
            <Card className="p-6 text-sm text-muted">
              {t.dashboard.allHealthy}
            </Card>
          ) : (
            <div className="space-y-3">
              {attention.map((p) => {
                const last = p.logs[0];
                return (
                  <Link key={p.id} href={`/app/pets/${p.id}`}>
                    <Card className="flex items-center gap-4 p-4 transition hover:shadow-md hover:shadow-slate-200/60">
                      <PetAvatar species={p.species} name={p.name} photoUrl={p.photoUrl} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{p.name}</span>
                          {p.status === "UNDER_OBSERVATION" && (
                            <Badge tone="amber" dot>
                              {t.statusShort.UNDER_OBSERVATION}
                            </Badge>
                          )}
                        </div>
                        {last && (
                          <p className="mt-0.5 truncate text-sm text-muted">
                            {last.title || last.rawText}
                          </p>
                        )}
                      </div>
                      {last && (
                        <Badge tone={SEVERITY_META[last.severity as Severity].color as Tone}>
                          {t.severity[last.severity as Severity]}
                        </Badge>
                      )}
                      <ArrowRight size={16} className="text-slate-300" />
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="pt-2">
            <SectionTitle
              title={t.dashboard.allPets}
              action={
                <Link href="/app/pets" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  {t.dashboard.viewAll}
                </Link>
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pets.slice(0, 6).map((p) => {
              const last = p.logs[0];
              return (
                <Link key={p.id} href={`/app/pets/${p.id}`}>
                  <Card className="flex items-center gap-3 p-4 transition hover:shadow-md hover:shadow-slate-200/60">
                    <PetAvatar species={p.species} name={p.name} size="sm" photoUrl={p.photoUrl} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground">{p.name}</div>
                      <div className="truncate text-xs text-muted">
                        {p.breed || (p.species === "DOG" ? t.species.DOG : t.species.CAT)}
                        {petAge(p.birthDate) ? ` · ${petAge(p.birthDate)}` : ""}
                      </div>
                    </div>
                    {last && (
                      <span className="text-base" title={LOG_TYPE_META[last.type as LogType].label}>
                        {LOG_TYPE_META[last.type as LogType].emoji}
                      </span>
                    )}
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <SectionTitle title={t.dashboard.upcomingReminders} />
          {reminders.length === 0 ? (
            <Card className="p-6 text-sm text-muted">{t.dashboard.noReminders}</Card>
          ) : (
            <Card className="divide-y divide-border">
              {reminders.slice(0, 8).map((r) => {
                const meta = REMINDER_CATEGORY_META[r.category as keyof typeof REMINDER_CATEGORY_META];
                const overdue = r.dueAt.getTime() < now;
                return (
                  <Link
                    key={r.id}
                    href={`/app/pets/${r.petId}`}
                    className="flex items-center gap-3 p-3.5 transition hover:bg-slate-50"
                  >
                    <span className="text-lg">{meta?.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{r.title}</div>
                      <div className="truncate text-xs text-muted">{r.pet.name}</div>
                    </div>
                    <Badge tone={overdue ? "rose" : "slate"}>{relativeTime(r.dueAt)}</Badge>
                  </Link>
                );
              })}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone: Tone;
}) {
  const toneBg: Record<Tone, string> = {
    slate: "bg-slate-100 text-slate-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    orange: "bg-orange-50 text-orange-600",
    rose: "bg-rose-50 text-rose-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
    teal: "bg-teal-50 text-teal-600",
    brand: "bg-brand-50 text-brand-600",
  };
  return (
    <Card className="p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneBg[tone]}`}>
        {icon}
      </div>
      <div className="mt-3 text-2xl font-semibold text-foreground">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </Card>
  );
}

// Hospital / boarding dashboard: pets currently in care + scan-to-admit.
async function FacilityDashboard({
  orgName,
  verified = false,
}: {
  orgName: string;
  verified?: boolean;
}) {
  const { t } = await getI18n();
  const stays = await getFacilityPets("ACTIVE");
  const items = stays.map(({ pet }) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    status: "ACTIVE",
    photoUrl: pet.photoUrl,
    birthDate: pet.birthDate ? pet.birthDate.toISOString() : null,
    logCount: pet._count.logs,
    last: pet.logs[0]
      ? {
          title: pet.logs[0].title,
          rawText: pet.logs[0].rawText,
          severity: pet.logs[0].severity,
          occurredAt: pet.logs[0].occurredAt.toISOString(),
        }
      : null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      {verified && (
        <div className="mb-6">
          <EmailVerifiedBanner message={t.verifyEmail.confirmedBanner} />
        </div>
      )}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{orgName}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {t.facility.inCareTitle}
          </h1>
        </div>
        <AdmitScanner />
      </header>

      <div className="mt-6">
        <PetsList
          pets={items}
          emptyTitle={t.facility.noActive}
          emptyDescription={t.facility.noActiveDesc}
          showAddAction={false}
        />
      </div>

      <div className="mt-6">
        <Link href="/app/pets?tab=archived" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          {t.facility.tabArchived} →
        </Link>
      </div>
    </div>
  );
}
