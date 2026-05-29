import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getActiveOrg } from "@/lib/data";
import { Card, Badge, EmptyState, Tone } from "@/components/ui";
import { ReminderToggle } from "@/components/ReminderToggle";
import { REMINDER_CATEGORY_META, ReminderCategory } from "@/lib/constants";
import { formatDate, relativeTime } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

export default async function RemindersPage() {
  const { t } = await getI18n();
  const org = await getActiveOrg();
  const reminders = await prisma.reminder.findMany({
    where: { pet: { orgId: org.id } },
    orderBy: { dueAt: "asc" },
    include: { pet: true },
  });

  const now = Date.now();
  const week = 1000 * 60 * 60 * 24 * 7;
  const active = reminders.filter((r) => !r.completed);
  const groups = {
    [t.remindersPage.overdue]: active.filter((r) => r.dueAt.getTime() < now),
    [t.remindersPage.thisWeek]: active.filter(
      (r) => r.dueAt.getTime() >= now && r.dueAt.getTime() < now + week,
    ),
    [t.remindersPage.upcoming]: active.filter((r) => r.dueAt.getTime() >= now + week),
  };
  const completed = reminders.filter((r) => r.completed);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 md:px-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.remindersPage.title}</h1>
      <p className="mt-1 text-sm text-muted">
        {t.remindersPage.subtitle}
      </p>

      {active.length === 0 && completed.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title={t.remindersPage.none}
            description={t.remindersPage.noneDesc}
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {Object.entries(groups).map(([label, items]) =>
            items.length === 0 ? null : (
              <section key={label}>
                <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                  {label}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                    {items.length}
                  </span>
                </h2>
                <Card className="divide-y divide-border">
                  {items.map((r) => {
                    const meta = REMINDER_CATEGORY_META[r.category as ReminderCategory];
                    const overdue = r.dueAt.getTime() < now;
                    return (
                      <div key={r.id} className="flex items-center gap-3 p-3.5">
                        <ReminderToggle id={r.id} completed={r.completed} />
                        <span className="text-lg">{meta?.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">
                            {r.title}
                          </div>
                          <Link
                            href={`/pets/${r.petId}`}
                            className="text-xs text-muted hover:text-brand-600"
                          >
                            {r.pet.name} · {formatDate(r.dueAt)}
                          </Link>
                        </div>
                        <Badge tone={(overdue ? "rose" : "slate") as Tone}>
                          {relativeTime(r.dueAt)}
                        </Badge>
                      </div>
                    );
                  })}
                </Card>
              </section>
            ),
          )}

          {completed.length > 0 && (
            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted">{t.remindersPage.completed}</h2>
              <Card className="divide-y divide-border">
                {completed.map((r) => (
                  <div key={r.id} className="flex items-center gap-3 p-3.5 opacity-60">
                    <ReminderToggle id={r.id} completed={r.completed} />
                    <div className="min-w-0 flex-1 truncate text-sm text-muted line-through">
                      {r.title} · {r.pet.name}
                    </div>
                  </div>
                ))}
              </Card>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
