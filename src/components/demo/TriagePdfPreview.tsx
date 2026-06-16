"use client";

import Image from "next/image";
import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { type Urgency } from "@/lib/constants";
import { formatDate, formatDateTime, type FormatOpts } from "@/lib/format";
import { useTimezone } from "@/lib/timezone/client";
import {
  DEMO_PET,
  DEMO_TRIAGE,
  DEMO_HEALTH_SNIPPET,
  DEMO_FOOD_SNIPPET,
  DEMO_ACTIVITY_SNIPPET,
} from "@/components/demo/triage-pdf-sample";

const GENERATED_AT = new Date("2026-06-16T10:15:00");

export function TriagePdfPreview() {
  const { t, locale } = useI18n();
  const timeZone = useTimezone();
  const fmt = { locale, timeZone };
  const urgency = DEMO_TRIAGE.urgency as Urgency;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print sticky top-0 z-10 border-b border-border bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-forest"
          >
            <ArrowLeft size={16} /> Demo hub
          </Link>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-sage">Preview only</p>
            <p className="text-sm font-medium text-forest">Vet handoff PDF layout</p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <Printer size={16} /> Print / Save PDF
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:px-0 print:py-0">
        <article className="triage-pdf-sheet rounded-2xl border border-border bg-white shadow-soft print:rounded-none print:border-0 print:shadow-none">
          {/* Header */}
          <header className="border-b border-border px-8 py-6 print:px-10">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-3">
                <Image
                  src="/brand/app-icon-32.png"
                  alt="PawSure"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
                <div>
                  <p className="text-lg font-extrabold tracking-tight text-forest">PawSure</p>
                  <p className="text-xs text-muted">Veterinary handoff report</p>
                </div>
              </div>
              <div className="text-right text-xs text-muted">
                <p>{formatDateTime(GENERATED_AT, fmt)}</p>
                <p className="mt-0.5">AI triage · owner-generated</p>
              </div>
            </div>
          </header>

          {/* Pet + owner */}
          <section className="grid gap-6 border-b border-border px-8 py-6 sm:grid-cols-2 print:px-10">
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">Patient</h2>
              <p className="mt-2 text-2xl font-extrabold text-forest">{DEMO_PET.name}</p>
              <dl className="mt-3 space-y-1 text-sm text-slate-700">
                <div className="flex gap-2">
                  <dt className="w-20 text-muted">Species</dt>
                  <dd>{DEMO_PET.species === "DOG" ? "Dog" : "Cat"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 text-muted">Breed</dt>
                  <dd>{DEMO_PET.breed}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 text-muted">Sex</dt>
                  <dd>{DEMO_PET.sex === "FEMALE" ? "Female" : "Male"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 text-muted">DOB</dt>
                  <dd>{formatDate(new Date(DEMO_PET.birthDate), fmt)}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 text-muted">Weight</dt>
                  <dd>{DEMO_PET.weightKg} kg</dd>
                </div>
              </dl>
            </div>
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">Owner contact</h2>
              <dl className="mt-3 space-y-1 text-sm text-slate-700">
                <div className="flex gap-2">
                  <dt className="w-20 text-muted">Name</dt>
                  <dd>{DEMO_PET.ownerName}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-20 text-muted">Phone</dt>
                  <dd>{DEMO_PET.ownerPhone}</dd>
                </div>
              </dl>
              <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Triage urgency
                </p>
                <p className="mt-1 font-semibold text-forest">{t.urgency[urgency].label}</p>
                <p className="mt-0.5 text-slate-600">{t.urgency[urgency].blurb}</p>
              </div>
            </div>
          </section>

          {/* Summary */}
          <section className="border-b border-border px-8 py-6 print:px-10 print:break-inside-avoid">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">Clinical summary</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-800">{DEMO_TRIAGE.summary}</p>
            <div className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-900">
              <span className="font-semibold">Recommended next step: </span>
              {DEMO_TRIAGE.recommendation}
            </div>
          </section>

          {/* Concerns */}
          <section className="border-b border-border px-8 py-6 print:px-10">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">
              {t.triage.concerns}
            </h2>
            <table className="mt-3 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted">
                  <th className="pb-2 pr-3 font-medium">Issue</th>
                  <th className="pb-2 pr-3 font-medium">Detail</th>
                  <th className="pb-2 font-medium">Severity</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_TRIAGE.concerns.map((c, i) => (
                  <tr key={i} className="border-b border-border/60 align-top">
                    <td className="py-2.5 pr-3 font-medium text-forest">{c.issue}</td>
                    <td className="py-2.5 pr-3 text-slate-700">{c.detail}</td>
                    <td className="py-2.5 text-slate-600">{t.severity[c.severity]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Cross-log */}
          {DEMO_TRIAGE.crossLogInsights.length > 0 && (
            <section className="border-b border-border px-8 py-6 print:px-10 print:break-inside-avoid">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">
                {t.triage.crossLogTitle}
              </h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                {DEMO_TRIAGE.crossLogInsights.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Vet questions + positives */}
          <section className="grid gap-6 border-b border-border px-8 py-6 sm:grid-cols-2 print:px-10">
            <div className="print:break-inside-avoid">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">
                {t.triage.vetQuestions}
              </h2>
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-700">
                {DEMO_TRIAGE.vetQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
            <div className="print:break-inside-avoid">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">
                {t.triage.reassuring}
              </h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-700">
                {DEMO_TRIAGE.positiveSigns.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* Log excerpts */}
          <section className="px-8 py-6 print:px-10">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage">
              Recent log excerpts
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <LogExcerpt title="Health log" items={DEMO_HEALTH_SNIPPET.map((h) => ({
                when: h.at,
                line: h.text,
              }))} fmt={fmt} />
              <LogExcerpt title="Food log" items={DEMO_FOOD_SNIPPET.map((f) => ({
                when: f.at,
                line: `${f.meal}: ${f.food} (${f.appetite})`,
              }))} fmt={fmt} />
              <LogExcerpt title="Activity log" items={DEMO_ACTIVITY_SNIPPET.map((a) => ({
                when: a.at,
                line: `${a.type} · ${a.duration} min · ${a.intensity}`,
              }))} fmt={fmt} />
            </div>
          </section>

          <footer className="border-t border-border px-8 py-5 text-center text-[10px] leading-relaxed text-muted print:px-10">
            {t.triage.disclaimer} Generated by PawSure from owner-maintained records — not a veterinary diagnosis.
          </footer>
        </article>
      </div>

      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .triage-pdf-sheet {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function LogExcerpt({
  title,
  items,
  fmt,
}: {
  title: string;
  items: { when: string; line: string }[];
  fmt: FormatOpts;
}) {
  return (
    <div className="rounded-xl border border-border p-3 print:break-inside-avoid">
      <p className="text-xs font-semibold text-forest">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-slate-600">
            <span className="block font-medium text-slate-500">
              {formatDateTime(new Date(item.when), fmt)}
            </span>
            {item.line}
          </li>
        ))}
      </ul>
    </div>
  );
}
