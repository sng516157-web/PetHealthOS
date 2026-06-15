"use client";

import { ShieldCheck, Lock, BadgeCheck, Stethoscope } from "lucide-react";
import { SAMPLE_PASSPORT } from "@/lib/landing/sample-data";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { Badge, PetAvatar, Tone } from "@/components/ui";
import {
  LOG_TYPE_META,
  SEVERITY_META,
  REMINDER_CATEGORY_META,
  ATTACHMENT_KIND_META,
  type LogType,
  type Severity,
  type ReminderCategory,
  type AttachmentKind,
} from "@/lib/constants";
import { useI18n } from "@/lib/i18n/client";

/** Static mock — layout mirrors `/passport/[token]` (issued passport page). */
export function SamplePetPassport({ compact }: { compact?: boolean }) {
  const { t } = useI18n();
  const p = SAMPLE_PASSPORT;
  const pet = p.pet;

  const meta = [
    pet.breed,
    t.sex[pet.sex],
    pet.age,
    pet.weightKg ? `${pet.weightKg} kg` : null,
    pet.color,
  ].filter(Boolean);

  const inner = (
    <div className="bg-background text-left">
      <div className="border-b border-border bg-surface px-4 py-3">
        <div className="flex items-center gap-2">
          <PawSureMarkTile className="h-8 w-8" />
          <span className="text-sm font-semibold text-foreground">{t.passport.title}</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              {t.landing.sampleBadge}
            </span>
            <Badge tone="brand">
              <ShieldCheck size={12} /> {t.passport.tamperEvident}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4 md:p-5">
        <section className="overflow-hidden rounded-2xl border border-forest/15 bg-surface shadow-sm">
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-brand-50 to-paper px-4 py-3">
            <PawSureMarkTile className="h-9 w-9 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-bold tracking-tight text-forest">
                {t.passport.certTitle}
              </h2>
              <p className="text-[11px] text-muted">{t.passport.certSubtitle}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
              <BadgeCheck size={12} /> {t.passport.verifiedShop}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            <CertField label={t.passport.certIssuedBy} value={p.orgName} />
            <CertField label={t.passport.certIssuedOn} value={p.issuedOn} />
            <CertField label={t.passport.certNo} value={p.certNo} mono />
            <CertField label={t.passport.recordSeal} value={p.seal} mono />
          </div>
          <p className="flex items-start gap-1.5 px-4 py-2.5 text-[10px] text-muted">
            <ShieldCheck size={12} className="mt-0.5 shrink-0 text-emerald-600" />
            {t.passport.sealNote}
          </p>
        </section>

        <div className="overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100/50 p-4 text-center">
          <div className="text-2xl">🎉</div>
          <h2 className="mt-1.5 text-base font-semibold text-brand-900">
            {t.passport.welcomeNoName}
          </h2>
          <p className="mt-1 text-xs text-brand-800">{t.passport.travels(pet.name)}</p>
          <span className="mt-2 inline-block rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
            {t.passport.sharedWith(p.orgName)}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xs font-semibold text-foreground">
                  {t.passport.guaranteeTitle}
                </h2>
                <Badge tone="emerald">{t.guaranteeType.D30}</Badge>
              </div>
              <p className="mt-1 text-xs font-medium text-emerald-800">
                {t.passport.guaranteeActive(p.guaranteeDaysRemaining)}
              </p>
              <p className="mt-1.5 text-xs text-slate-600">{p.guaranteeTerms}</p>
              <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-border bg-background p-2 text-xs">
                <Stethoscope size={14} className="mt-0.5 shrink-0 text-brand-500" />
                <div>
                  <p className="font-medium text-foreground">
                    {t.passport.vetCheckedTitle} ·{" "}
                    <span className="font-normal text-muted">
                      {t.passport.vetCheckedOn(p.vetCheckedOn)}
                    </span>
                  </p>
                  <p className="mt-0.5 text-slate-600">{p.vetCheckNote}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface p-3.5">
          <Lock size={16} className="mt-0.5 shrink-0 text-emerald-600" />
          <div className="text-xs">
            <p className="font-medium text-foreground">
              {t.passport.trustHeadline(p.entryCount, p.spanLabel)}
            </p>
            <p className="mt-0.5 text-muted">{t.passport.trustBody(pet.name)}</p>
          </div>
        </div>

        <p className="rounded-2xl border border-border bg-surface p-3 text-center text-[11px] text-muted">
          {t.passport.viewOnly(p.orgName)}
        </p>

        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <PetAvatar species={pet.species} name={pet.name} size="lg" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">{pet.name}</h1>
              <p className="mt-0.5 text-xs text-muted">
                {(pet.species === "DOG" ? t.species.DOG : t.species.CAT) +
                  (meta.length ? " · " + meta.join(" · ") : "")}
              </p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
            <Field label={t.passport.microchip} value={pet.microchip} />
            <Field label={t.passport.intakeDate} value={pet.intakeAt} />
            <Field label={t.passport.from} value={p.orgName} />
            {pet.dam && <Field label={t.passport.parents} value={`× ${pet.dam}`} />}
          </div>
          {p.transferNote && (
            <div className="mt-3 rounded-xl bg-brand-50/60 p-2.5 text-xs text-brand-900">
              <span className="font-medium">{t.passport.note}</span>
              {p.transferNote}
            </div>
          )}
        </div>

        <section>
          <h2 className="mb-2 text-xs font-semibold text-foreground">{t.passport.documents}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {p.attachments.map((a) => {
              const m = ATTACHMENT_KIND_META[a.kind as AttachmentKind];
              return (
                <div
                  key={a.label}
                  className="overflow-hidden rounded-xl border border-border bg-surface"
                >
                  <div className="flex h-20 w-full items-center justify-center bg-slate-50 text-2xl">
                    📄
                  </div>
                  <div className="p-2">
                    <div className="truncate text-xs font-medium text-foreground">{a.label}</div>
                    <div className="text-[10px] text-muted">
                      {t.attachmentKind[a.kind as AttachmentKind] ?? m?.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold text-foreground">
            {t.passport.upcomingCare}
          </h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
            {p.reminders.map((r) => {
              const m = REMINDER_CATEGORY_META[r.category as ReminderCategory];
              return (
                <div key={r.title} className="flex items-center gap-2.5 p-3">
                  <span className="text-base">{m?.emoji}</span>
                  <span className="flex-1 text-xs font-medium text-foreground">{r.title}</span>
                  <span className="text-[10px] text-muted">{r.dueAt}</span>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-semibold text-foreground">
            {t.passport.completeHistory(p.logs.length)}
          </h2>
          <ol className="relative space-y-2.5 border-l border-border pl-5">
            {p.logs.map((l) => {
              const tm = LOG_TYPE_META[l.type as LogType];
              const sm = SEVERITY_META[l.severity as Severity];
              return (
                <li key={l.title} className="relative">
                  <span className="absolute -left-[26px] flex h-5 w-5 items-center justify-center rounded-full bg-surface text-xs ring-1 ring-border">
                    {tm.emoji}
                  </span>
                  <div className="rounded-xl border border-border bg-surface p-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-medium text-foreground">
                        {l.title || t.logType[l.type as LogType]}
                      </span>
                      <Badge tone={tm.color as Tone}>{t.logType[l.type as LogType]}</Badge>
                      {l.severity !== "NONE" && (
                        <Badge tone={sm.color as Tone}>
                          {t.severity[l.severity as Severity]}
                        </Badge>
                      )}
                      <span className="ml-auto text-[10px] text-slate-400">{l.occurredAt}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600">{l.text}</p>
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                      <Lock size={9} />
                      {t.passport.logged} {l.loggedAgo}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="flex flex-col items-center gap-1.5 pt-2">
          <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-white ring-1 ring-border">
            <svg viewBox="0 0 29 29" className="h-20 w-20 text-forest/80" aria-hidden>
              <rect x="0" y="0" width="7" height="7" fill="currentColor" />
              <rect x="22" y="0" width="7" height="7" fill="currentColor" />
              <rect x="0" y="22" width="7" height="7" fill="currentColor" />
              <rect x="10" y="10" width="3" height="3" fill="currentColor" />
              <rect x="14" y="10" width="3" height="3" fill="currentColor" />
              <rect x="18" y="10" width="3" height="3" fill="currentColor" />
              <rect x="10" y="14" width="3" height="3" fill="currentColor" />
              <rect x="18" y="14" width="3" height="3" fill="currentColor" />
              <rect x="10" y="18" width="3" height="3" fill="currentColor" />
              <rect x="14" y="18" width="3" height="3" fill="currentColor" />
              <rect x="22" y="22" width="3" height="3" fill="currentColor" />
            </svg>
          </div>
          <span className="text-[10px] text-muted">{t.passport.scanToOpen}</span>
        </div>

        <p className="text-center text-[10px] text-muted">{t.passport.issuedBy(p.orgName)}</p>
      </div>
    </div>
  );

  return (
    <div
      id="sample-passport"
      className="overflow-hidden rounded-2xl border border-border shadow-soft"
    >
      {compact ? (
        <div className="max-h-[min(720px,70vh)] overflow-y-auto">{inner}</div>
      ) : (
        inner
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 truncate text-xs font-medium text-foreground">{value}</div>
    </div>
  );
}

function CertField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-surface px-3 py-2.5">
      <div className="text-[9px] uppercase tracking-wide text-muted">{label}</div>
      <div
        className={`mt-0.5 truncate font-semibold text-foreground ${
          mono ? "font-mono text-[10px] tracking-wider" : "text-xs"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
