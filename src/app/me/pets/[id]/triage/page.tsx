import { notFound } from "next/navigation";
import { Stethoscope } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { hasAI } from "@/lib/ai";
import { EmptyState } from "@/components/ui";
import { GenerateTriageButton } from "@/components/GenerateTriageButton";
import { TriageReport } from "@/components/TriageReport";
import type { TriageResult } from "@/lib/ai";
import { MotionPop } from "@/components/dashboard/DashboardMotion";
import { getI18n } from "@/lib/i18n/server";
import { getTimezone } from "@/lib/timezone/server";

export default async function MePetTriagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const pet = await getOwnedPet(user.id, id);
  if (!pet) notFound();
  const { t, locale } = await getI18n();
  const timeZone = await getTimezone();
  const fmt = { timeZone, locale };

  const reports = await prisma.triageReport.findMany({
    where: { petId: pet.id },
    orderBy: { createdAt: "desc" },
    take: 1,
  });
  const latest = reports[0];
  const report: TriageResult | null = latest
    ? { crossLogInsights: [], ...JSON.parse(latest.content) }
    : null;

  return (
    <div className="space-y-6">
      <MotionPop index={0}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-lg">
            <h2 className="text-lg font-semibold text-forest">{t.triage.title}</h2>
            <p className="mt-1 text-sm text-muted">{t.triage.subtitle(pet.name)}</p>
          </div>
          <GenerateTriageButton petId={pet.id} hasExisting={Boolean(latest)} />
        </div>
      </MotionPop>

      {!hasAI() && (
        <MotionPop index={1}>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-soft">
            <strong>{t.common.demoBadge}:</strong> {t.triage.demoNote}
          </div>
        </MotionPop>
      )}

      <MotionPop index={2}>
        {!report ? (
          <EmptyState
            icon={<Stethoscope size={40} />}
            title={t.triage.none}
            description={t.triage.noneDesc(pet.name)}
          />
        ) : (
          <TriageReport t={t} report={report} createdAt={latest.createdAt} fmt={fmt} />
        )}
      </MotionPop>
    </div>
  );
}
