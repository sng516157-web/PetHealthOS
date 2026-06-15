"use client";

import { Calendar, Camera, Pill, Utensils, ClipboardList } from "lucide-react";
import { SAMPLE_STAY } from "@/lib/landing/sample-data";
import { useI18n } from "@/lib/i18n/client";

export function SampleStayReport() {
  const { t } = useI18n();
  const s = SAMPLE_STAY;
  const f = t.landing.facility;

  return (
    <div
      id="sample-stay"
      className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-soft"
    >
      <div className="border-b border-border bg-gradient-to-r from-teal-50/80 to-surface px-5 py-4 md:px-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-lg font-extrabold text-forest">{f.stayReportTitle(s.petName)}</p>
            <p className="text-xs text-muted">{s.facility}</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
            {t.landing.sampleBadge}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink/70">
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} className="text-sage" /> {f.stayCheckIn(s.checkIn)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar size={13} className="text-sage" /> {f.stayCheckOut(s.checkOut)}
          </span>
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-2 md:p-6">
        <ReportBlock icon={<Utensils size={15} />} title={f.stayFeeding} body={s.feeding} />
        <ReportBlock icon={<Pill size={15} />} title={f.stayMedication} body={s.medication} />
        <ReportBlock icon={<ClipboardList size={15} />} title={f.stayWeight} body={s.weight} />
        <ReportBlock
          icon={<Camera size={15} />}
          title={f.stayPhotos}
          body={f.stayPhotosBody(s.photos)}
        />
      </div>

      <div className="border-t border-border bg-paper/50 px-5 py-4 md:px-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-sage">
          {f.stayStaffNotes}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink/75">{s.staffNotes}</p>
        <p className="mt-4 rounded-xl bg-brand-50/60 px-3 py-2.5 text-xs leading-relaxed text-brand-900">
          {s.summary}
        </p>
      </div>
    </div>
  );
}

function ReportBlock({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-white/80 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-forest">
        <span className="text-sage">{icon}</span> {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink/75">{body}</p>
    </div>
  );
}
