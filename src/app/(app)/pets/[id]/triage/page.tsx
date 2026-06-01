import { notFound } from "next/navigation";
import { Stethoscope, AlertCircle, ClipboardList, CheckCircle2, MessageSquareText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { hasAI } from "@/lib/ai";
import { Card, Badge, Tone, EmptyState } from "@/components/ui";
import { GenerateTriageButton } from "@/components/GenerateTriageButton";
import { Markdown } from "@/components/Markdown";
import { URGENCY_META, SEVERITY_META, Urgency, Severity } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import type { TriageResult } from "@/lib/ai";
import { getI18n } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/en";

export default async function TriagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { reports: { orderBy: { createdAt: "desc" }, take: 5 } },
  });
  if (!pet) notFound();

  const latest = pet.reports[0];
  const report: TriageResult | null = latest ? JSON.parse(latest.content) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-lg">
          <h2 className="text-lg font-semibold text-foreground">{t.triage.title}</h2>
          <p className="mt-1 text-sm text-muted">
            {t.triage.subtitle(pet.name)}
          </p>
        </div>
        <GenerateTriageButton petId={pet.id} hasExisting={Boolean(latest)} />
      </div>

      {!hasAI() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{t.common.demoBadge}:</strong> {t.triage.demoNote}
        </div>
      )}

      {!report ? (
        <EmptyState
          icon={<Stethoscope size={40} />}
          title={t.triage.none}
          description={t.triage.noneDesc(pet.name)}
        />
      ) : (
        <div className="space-y-5">
          <UrgencyBanner urgency={report.urgency as Urgency} t={t} />

          <Card className="p-5">
            <SectionHead icon={<Stethoscope size={16} />} title={t.triage.summary} />
            <div className="mt-2 text-slate-700">
              <Markdown>{report.summary}</Markdown>
            </div>
            <div className="mt-3 rounded-lg bg-background p-3 text-foreground">
              <Markdown>{`👉 ${report.recommendation}`}</Markdown>
            </div>
          </Card>

          {report.concerns.length > 0 && (
            <Card className="p-5">
              <SectionHead icon={<AlertCircle size={16} />} title={t.triage.concerns} />
              <div className="mt-3 space-y-3">
                {report.concerns.map((c, i) => (
                  <div key={i} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">{c.issue}</span>
                      <Badge tone={SEVERITY_META[c.severity as Severity].color as Tone}>
                        {t.severity[c.severity as Severity]}
                      </Badge>
                    </div>
                    <div className="mt-1 text-slate-600">
                      <Markdown>{c.detail}</Markdown>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {report.vetQuestions.length > 0 && (
            <Card className="p-5">
              <SectionHead icon={<MessageSquareText size={16} />} title={t.triage.vetQuestions} />
              <ul className="mt-3 space-y-2">
                {report.vetQuestions.map((q, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <ClipboardList size={15} className="mt-0.5 shrink-0 text-brand-500" />
                    {q}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {report.positiveSigns.length > 0 && (
            <Card className="p-5">
              <SectionHead icon={<CheckCircle2 size={16} />} title={t.triage.reassuring} />
              <ul className="mt-3 space-y-1.5">
                {report.positiveSigns.map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-700">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                    {p}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <p className="text-center text-xs text-muted">
            {t.triage.generatedAt} {formatDateTime(latest.createdAt)} · {t.triage.disclaimer}
          </p>
        </div>
      )}
    </div>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="text-brand-600">{icon}</span>
      {title}
    </div>
  );
}

function UrgencyBanner({ urgency, t }: { urgency: Urgency; t: Dictionary }) {
  const meta = URGENCY_META[urgency];
  const toneRing: Record<string, string> = {
    rose: "border-rose-200 bg-rose-50",
    orange: "border-orange-200 bg-orange-50",
    amber: "border-amber-200 bg-amber-50",
    sky: "border-sky-200 bg-sky-50",
    emerald: "border-emerald-200 bg-emerald-50",
  };
  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-5 ${toneRing[meta.color]}`}>
      <div className="text-3xl">
        {urgency === "EMERGENCY" || urgency === "URGENT" ? "🚨" : urgency === "ROUTINE" ? "✅" : "⚠️"}
      </div>
      <div>
        <Badge tone={meta.color as Tone}>{t.urgency[urgency].label}</Badge>
        <p className="mt-1.5 text-sm font-medium text-foreground">{t.urgency[urgency].blurb}</p>
      </div>
    </div>
  );
}
