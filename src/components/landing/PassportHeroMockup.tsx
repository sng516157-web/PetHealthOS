"use client";

import { BadgeCheck, FileText, QrCode, Scale, ShieldCheck, Syringe } from "lucide-react";
import { SAMPLE_PASSPORT } from "@/lib/landing/sample-data";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { PetAvatar } from "@/components/ui";
import { useI18n } from "@/lib/i18n/client";

/** Condensed passport visual for homepage hero — the “product moment” at handover. */
export function PassportHeroMockup() {
  const { t } = useI18n();
  const h = t.landing.homepageV2.passportHero;
  const p = SAMPLE_PASSPORT;
  const pet = p.pet;

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-200/40 via-sand/30 to-brand-100/20 blur-2xl"
      />
      <div className="relative overflow-hidden rounded-3xl border border-forest/10 bg-surface shadow-[0_24px_60px_rgba(36,89,76,0.14)] ring-1 ring-inset ring-white/80">
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-brand-50 to-paper px-4 py-3">
          <div className="flex items-center gap-2">
            <PawSureMarkTile className="h-8 w-8" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sage">
                {t.passport.title}
              </p>
              <p className="text-xs font-bold text-forest">{pet.name}</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
            {h.readyForHandover}
          </span>
        </div>

        <div className="space-y-3 p-4">
          <div className="flex items-start gap-3 rounded-2xl border border-border bg-paper p-3">
            <PetAvatar species={pet.species} name={pet.name} size="lg" />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-extrabold text-forest">{pet.name}</h3>
              <p className="text-xs text-muted">
                {pet.breed} · {pet.species === "DOG" ? t.species.DOG : t.species.CAT}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                {t.passport.from}: <span className="font-semibold text-forest">{p.orgName}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MiniStat
              icon={<Syringe size={14} className="text-brand-600" />}
              label={h.vaccinationStatus}
              value={h.vaccinationUpToDate}
              tone="brand"
            />
            <MiniStat
              icon={<Scale size={14} className="text-sky-600" />}
              label={h.weightHistory}
              value={`${pet.weightKg} kg · steady gain`}
              tone="sky"
            />
          </div>

          <div className="rounded-2xl border border-border bg-paper p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-sage">
              {h.careNotes}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink/80">
              {p.transferNote}
            </p>
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-sage">
              {h.documents}
            </p>
            <div className="flex flex-wrap gap-2">
              {p.attachments.map((a) => (
                <span
                  key={a.label}
                  className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[10px] font-medium text-forest"
                >
                  <FileText size={11} className="text-muted" /> {a.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-forest/15 bg-gradient-to-r from-brand-50/80 to-paper p-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-semibold text-forest">
                <ShieldCheck size={12} className="text-emerald-600" />
                {h.handoverSeal}
              </div>
              <p className="mt-0.5 font-mono text-[10px] tracking-wider text-muted">{p.seal}</p>
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-brand-800 ring-1 ring-inset ring-brand-200">
                <BadgeCheck size={10} /> {h.sharedWithOwner}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white ring-1 ring-border">
                <QrCode size={36} className="text-forest/75" strokeWidth={1.25} />
              </div>
              <span className="text-[9px] text-muted">{h.scanQr}</span>
            </div>
          </div>

          <p className="text-center text-[9px] leading-snug text-muted">
            {t.landing.homepageV2.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "brand" | "sky";
}) {
  const bg = tone === "brand" ? "bg-brand-50/80" : "bg-sky-50/80";
  return (
    <div className={`rounded-xl border border-border ${bg} p-2.5`}>
      <div className="flex items-center gap-1 text-[10px] font-semibold text-muted">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-[11px] font-medium leading-snug text-forest">{value}</p>
    </div>
  );
}
