"use client";

import { useState, useTransition } from "react";
import { Stethoscope, Sparkles } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { generateOrgWardTriageReport } from "@/app/actions";
import type { OrgWardTriageResult } from "@/lib/ai";
import { useI18n } from "@/lib/i18n/client";
import type { Tone } from "@/components/ui";

const URGENCY_TONE: Record<string, Tone> = {
  EMERGENCY: "rose",
  URGENT: "orange",
  SOON: "amber",
  MONITOR: "sky",
  ROUTINE: "emerald",
};

export function OrgWardTriagePanel({
  aiEnabled,
  preview = false,
  previewReport,
}: {
  aiEnabled: boolean;
  preview?: boolean;
  previewReport?: OrgWardTriageResult;
}) {
  const { t, locale } = useI18n();
  const [report, setReport] = useState<OrgWardTriageResult | null>(previewReport ?? null);
  const [pending, startTransition] = useTransition();

  function run() {
    if (preview) {
      setReport(previewReport ?? null);
      return;
    }
    startTransition(async () => {
      const res = await generateOrgWardTriageReport(locale);
      if (res && "report" in res) setReport(res.report);
    });
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope size={18} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-forest">{t.orgAi.wardTitle}</h2>
          </div>
          <p className="mt-1 text-sm text-muted">{t.orgAi.wardDesc}</p>
        </div>
        <button
          type="button"
          onClick={run}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Sparkles size={15} />
          {report ? t.orgAi.rerunWard : t.orgAi.runWard}
        </button>
      </div>

      {!aiEnabled && (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t.orgAi.wardDemoNote}
        </p>
      )}

      {report && (
        <div className="mt-5 space-y-4">
          <p className="text-sm leading-relaxed text-slate-700">{report.summary}</p>
          {report.watchList.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                {t.orgAi.watchListTitle}
              </p>
              <ul className="mt-2 space-y-2">
                {report.watchList.map((w) => (
                  <li
                    key={w.petName}
                    className="flex flex-wrap items-start gap-2 rounded-xl border border-border p-3"
                  >
                    <span className="font-semibold text-forest">{w.petName}</span>
                    <Badge tone={URGENCY_TONE[w.urgency] ?? "slate"}>{w.urgency}</Badge>
                    <p className="w-full text-sm text-muted">{w.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {report.teamNotes.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sage">
                {t.orgAi.teamNotesTitle}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                {report.teamNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-xs text-muted">{t.triage.disclaimer}</p>
        </div>
      )}
    </Card>
  );
}
