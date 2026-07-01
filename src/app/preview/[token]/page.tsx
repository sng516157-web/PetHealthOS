import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { proxyImageSrc } from "@/lib/img";
import { Badge, PetAvatar } from "@/components/ui";
import { LOG_TYPE_META, SEVERITY_META, LogType, Severity } from "@/lib/constants";
import { petAge, formatDate, formatDateTime } from "@/lib/format";
import { getTimezone } from "@/lib/timezone/server";
import { getI18n } from "@/lib/i18n/server";
import { LocaleToggle } from "@/components/LocaleToggle";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import type { Sex } from "@/lib/constants";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { t, locale } = await getI18n();
  const timeZone = await getTimezone();
  const fmt = { timeZone, locale };

  const pet = await prisma.pet.findUnique({
    where: { previewToken: token },
    include: {
      org: true,
      logs: { orderBy: { occurredAt: "desc" }, take: 50 },
      weights: { orderBy: { measuredAt: "desc" }, take: 10 },
      transfers: { select: { id: true }, take: 1 },
    },
  });
  if (!pet || pet.transfers.length > 0) notFound();

  const orgName = pet.org?.name ?? t.common.appName;
  const meta = [
    pet.breed,
    pet.sex && pet.sex !== "UNKNOWN" ? t.sex[pet.sex as Sex] : null,
    petAge(pet.birthDate),
    pet.weightKg ? `${pet.weightKg} kg` : null,
    pet.color,
    pet.litterName ? t.litter.filterLabel(pet.litterName) : null,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-4">
          <PawSureMarkTile className="h-9 w-9" />
          <span className="text-sm font-semibold text-foreground">{t.preview.pageTitle}</span>
          <div className="ml-auto">
            <LocaleToggle compact />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Eye size={20} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{t.preview.bannerTitle}</p>
            <p className="mt-0.5 text-amber-800">{t.preview.bannerDesc}</p>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-start gap-4">
            <PetAvatar species={pet.species} name={pet.name} photoUrl={proxyImageSrc(pet.photoUrl)} size="lg" />
            <div>
              <h1 className="text-2xl font-bold text-forest">{pet.name}</h1>
              <p className="mt-1 text-sm text-muted">{meta.join(" · ")}</p>
              <p className="mt-2 text-xs text-muted">
                {t.preview.issuedBy(orgName)}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold text-forest">{t.preview.healthLog}</h2>
          {pet.logs.length === 0 ? (
            <p className="mt-3 text-sm text-muted">{t.preview.noLogs}</p>
          ) : (
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
              {pet.logs.map((log) => {
                const typeMeta = LOG_TYPE_META[log.type as LogType];
                const sev = SEVERITY_META[log.severity as Severity];
                return (
                  <li key={log.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span>{typeMeta?.emoji}</span>
                      <span>{formatDateTime(log.occurredAt, fmt)}</span>
                      {sev.rank >= 3 && (
                        <Badge tone="amber" className="text-[10px]">
                          {sev.label}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-foreground">
                      {log.title || log.rawText}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {pet.weights.length > 0 && (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-forest">{t.preview.weights}</h2>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {pet.weights.map((w) => (
                <li key={w.id}>
                  {formatDate(w.measuredAt, fmt)} — {w.weightKg} kg
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
