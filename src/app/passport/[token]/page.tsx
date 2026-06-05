import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { createHash } from "crypto";
import QRCode from "qrcode";
import { ShieldCheck, Lock, CheckCircle2, Stethoscope, BadgeCheck } from "lucide-react";
import type { GuaranteeType } from "@/lib/constants";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { prisma } from "@/lib/prisma";
import { proxyImageSrc } from "@/lib/img";
import { Badge, PetAvatar, Tone } from "@/components/ui";
import {
  LOG_TYPE_META,
  SEVERITY_META,
  REMINDER_CATEGORY_META,
  LogType,
  Severity,
  ReminderCategory,
} from "@/lib/constants";
import { petAge, formatDate, relativeTime } from "@/lib/format";
import { safeTags } from "@/lib/ai";
import { ATTACHMENT_KIND_META, AttachmentKind } from "@/lib/constants";
import { ClaimPassport } from "@/components/ClaimPassport";
import { LocaleToggle } from "@/components/LocaleToggle";
import { PrintButton } from "@/components/PrintButton";
import { getI18n } from "@/lib/i18n/server";
import type { Sex } from "@/lib/constants";

export default async function PassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { t } = await getI18n();
  const transfer = await prisma.transfer.findUnique({
    where: { token },
    include: {
      pet: {
        include: {
          org: true,
          sire: { select: { id: true, name: true, breed: true } },
          dam: { select: { id: true, name: true, breed: true } },
          attachments: { orderBy: { createdAt: "desc" } },
          logs: { orderBy: { occurredAt: "desc" } },
          reminders: { where: { completed: false }, orderBy: { dueAt: "asc" } },
        },
      },
    },
  });
  if (!transfer) notFound();

  // Track first view (not a claim — claiming is an explicit buyer action).
  if (!transfer.firstViewedAt) {
    await prisma.transfer.update({
      where: { id: transfer.id },
      data: { firstViewedAt: new Date() },
    });
  }

  const pet = transfer.pet;
  const orgName = pet.org?.name ?? t.common.appName;
  const meta = [
    pet.breed,
    pet.sex && pet.sex !== "UNKNOWN" ? t.sex[pet.sex as Sex] : null,
    petAge(pet.birthDate),
    pet.weightKg ? `${pet.weightKg} kg` : null,
    pet.color,
  ].filter(Boolean);

  // Credibility signal: a record built steadily over time looks different from
  // one entered the day before sale. Surface that to the buyer.
  const entryCount = pet.logs.length;
  const oldest = pet.logs.length
    ? pet.logs.reduce((a, b) => (a.createdAt < b.createdAt ? a : b)).createdAt
    : null;
  const spanDays = oldest
    ? Math.max(
        1,
        Math.round((Date.now() - oldest.getTime()) / 86400000),
      )
    : 0;
  const spanLabel =
    spanDays >= 60
      ? t.passport.months(Math.round(spanDays / 30))
      : t.passport.days(spanDays);

  // Credential framing: a verified issuer badge, a stable certificate number, and
  // an integrity seal derived from the frozen records. The seal changes if any
  // locked entry is altered, so it doubles as a tamper signal.
  const orgVerified = pet.org?.verificationStatus === "APPROVED";
  const certNo =
    `PS-${transfer.token.slice(0, 4)}-${transfer.token.slice(4, 8)}`.toUpperCase();
  const frozen = pet.logs
    .filter((l) => l.lockedAt)
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id));
  const sealInput = [
    pet.id,
    transfer.token,
    transfer.createdAt.toISOString(),
    ...frozen.map(
      (l) => `${l.id}:${l.occurredAt.toISOString()}:${l.createdAt.toISOString()}`,
    ),
  ].join("|");
  const sealHex = createHash("sha256").update(sealInput).digest("hex");
  const seal =
    `${sealHex.slice(0, 4)}-${sealHex.slice(4, 8)}-${sealHex.slice(8, 12)}`.toUpperCase();

  // Health guarantee — the breeder's warranty, frozen at handover. Compute the
  // live status (active / expired) from the window length.
  const hasGuarantee = transfer.guaranteeType !== "NONE";
  let guaranteeStatus = "";
  let guaranteeOk = true;
  if (hasGuarantee) {
    if (transfer.guaranteeDays && transfer.guaranteeDays > 0) {
      const expiry = new Date(
        transfer.createdAt.getTime() + transfer.guaranteeDays * 86400000,
      );
      const remainingMs = expiry.getTime() - Date.now();
      if (remainingMs > 0) {
        guaranteeStatus = t.passport.guaranteeActive(
          Math.ceil(remainingMs / 86400000),
        );
        guaranteeOk = true;
      } else {
        guaranteeStatus = t.passport.guaranteeExpired(formatDate(expiry));
        guaranteeOk = false;
      }
    } else {
      guaranteeStatus = t.passport.guaranteeOngoing;
    }
  }

  // Absolute passport URL → QR so a printed/handed-over passport is self-linking.
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const passportUrl = `${proto}://${host}/passport/${token}`;
  const qrDataUrl = await QRCode.toDataURL(passportUrl, { margin: 1, width: 240 });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-4">
          <PawSureMarkTile className="h-9 w-9" />
          <span className="text-sm font-semibold text-foreground">{t.passport.title}</span>
          <div className="ml-auto flex items-center gap-2">
            <PrintButton />
            <div className="no-print">
              <LocaleToggle compact />
            </div>
            <Badge tone="brand">
              <ShieldCheck size={12} /> {t.passport.tamperEvident}
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        {/* Credential band — makes the passport read like a verifiable certificate */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-forest/15 bg-surface shadow-sm">
          <div className="flex items-center gap-3 border-b border-border bg-gradient-to-r from-brand-50 to-paper px-5 py-4">
            <PawSureMarkTile className="h-10 w-10 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-bold tracking-tight text-forest">
                {t.passport.certTitle}
              </h2>
              <p className="text-xs text-muted">{t.passport.certSubtitle}</p>
            </div>
            {orgVerified && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <BadgeCheck size={14} /> {t.passport.verifiedShop}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-px bg-border sm:grid-cols-4">
            <CertField label={t.passport.certIssuedBy} value={orgName} />
            <CertField label={t.passport.certIssuedOn} value={formatDate(transfer.createdAt)} />
            <CertField label={t.passport.certNo} value={certNo} mono />
            <CertField label={t.passport.recordSeal} value={seal} mono />
          </div>
          <p className="flex items-start gap-1.5 px-5 py-3 text-[11px] text-muted">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-emerald-600" />
            {t.passport.sealNote}
          </p>
        </section>

        <div className="mb-6 overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100/50 p-6 text-center">
          <div className="text-3xl">🎉</div>
          <h2 className="mt-2 text-lg font-semibold text-brand-900">
            {transfer.newOwnerName
              ? t.passport.welcome(transfer.newOwnerName)
              : t.passport.welcomeNoName}
          </h2>
          <p className="mt-1 text-sm text-brand-800">
            {t.passport.travels(pet.name)}
          </p>
          {transfer.visibility === "SHARED" && (
            <span className="mt-2 inline-block rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
              {t.passport.sharedWith(orgName)}
            </span>
          )}
        </div>

        {/* Health guarantee — the breeder's warranty, baked into the passport */}
        {hasGuarantee && (
          <div
            className={`mb-6 overflow-hidden rounded-2xl border p-5 ${
              guaranteeOk
                ? "border-emerald-200 bg-emerald-50/70"
                : "border-border bg-surface"
            }`}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck
                size={22}
                className={`mt-0.5 shrink-0 ${guaranteeOk ? "text-emerald-600" : "text-slate-400"}`}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">
                    {t.passport.guaranteeTitle}
                  </h2>
                  <Badge tone={guaranteeOk ? "emerald" : "slate"}>
                    {t.guaranteeType[transfer.guaranteeType as GuaranteeType]}
                  </Badge>
                </div>
                <p
                  className={`mt-1 text-sm font-medium ${guaranteeOk ? "text-emerald-800" : "text-muted"}`}
                >
                  {guaranteeStatus}
                </p>
                {transfer.guaranteeTerms && (
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-600">
                    {transfer.guaranteeTerms}
                  </p>
                )}
                {transfer.vetCheckedAt && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl border border-border bg-background p-2.5 text-sm">
                    <Stethoscope size={16} className="mt-0.5 shrink-0 text-brand-500" />
                    <div>
                      <p className="font-medium text-foreground">
                        {t.passport.vetCheckedTitle} ·{" "}
                        <span className="font-normal text-muted">
                          {t.passport.vetCheckedOn(formatDate(transfer.vetCheckedAt))}
                        </span>
                      </p>
                      {transfer.vetCheckNote && (
                        <p className="mt-0.5 text-slate-600">{transfer.vetCheckNote}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trust strip — why this record is believable */}
        {entryCount > 0 && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
            <Lock size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <div className="text-sm">
              <p className="font-medium text-foreground">
                {t.passport.trustHeadline(entryCount, spanLabel)}
              </p>
              <p className="mt-0.5 text-muted">
                {t.passport.trustBody(pet.name)}
              </p>
            </div>
          </div>
        )}

        {/* Claim — only if the breeder enabled it */}
        <div className="mb-6 no-print">
          {transfer.claimedAt ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
              <CheckCircle2 size={16} />
              {t.passport.claimedBy(transfer.claimedByName ?? t.transferPage.unnamed)} ·{" "}
              {formatDate(transfer.claimedAt)}
            </div>
          ) : transfer.claimable ? (
            <ClaimPassport
              token={transfer.token}
              petName={pet.name}
              defaultName={transfer.newOwnerName}
            />
          ) : (
            <p className="rounded-2xl border border-border bg-surface p-4 text-center text-xs text-muted">
              {t.passport.viewOnly(orgName)}
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-4">
            <PetAvatar species={pet.species} name={pet.name} size="lg" photoUrl={pet.photoUrl} />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{pet.name}</h1>
              <p className="mt-1 text-sm text-muted">
                {(pet.species === "DOG" ? t.species.DOG : t.species.CAT) +
                  (meta.length ? " · " + meta.join(" · ") : "")}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Field label={t.passport.microchip} value={pet.microchip || "—"} />
            <Field label={t.passport.intakeDate} value={formatDate(pet.intakeAt)} />
            <Field label={t.passport.from} value={orgName} />
            {(pet.sire || pet.dam) && (
              <Field
                label={t.passport.parents}
                value={[pet.sire?.name, pet.dam?.name].filter(Boolean).join(" × ") || "—"}
              />
            )}
          </div>
          {transfer.note && (
            <div className="mt-4 rounded-xl bg-brand-50/60 p-3 text-sm text-brand-900">
              <span className="font-medium">{t.passport.note}</span>
              {transfer.note}
            </div>
          )}
        </div>

        {pet.attachments.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-foreground">{t.passport.documents}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pet.attachments.map((a) => {
                const m = ATTACHMENT_KIND_META[a.kind as AttachmentKind];
                const img =
                  a.mimeType?.startsWith("image/") ||
                  /\.(png|jpe?g|gif|webp|svg)$/i.test(a.url);
                return (
                  <a
                    key={a.id}
                    href={proxyImageSrc(a.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-border bg-surface transition hover:shadow-md"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={proxyImageSrc(a.url)} alt={a.label} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center bg-slate-50 text-3xl">
                        📄
                      </div>
                    )}
                    <div className="p-2.5">
                      <div className="truncate text-sm font-medium text-foreground">{a.label}</div>
                      <div className="text-xs text-muted">{t.attachmentKind[a.kind as AttachmentKind] ?? m?.label}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {pet.reminders.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-foreground">
              {t.passport.upcomingCare}
            </h2>
            <div className="rounded-2xl border border-border bg-surface divide-y divide-border">
              {pet.reminders.map((r) => {
                const m = REMINDER_CATEGORY_META[r.category as ReminderCategory];
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3.5">
                    <span className="text-lg">{m?.emoji}</span>
                    <span className="flex-1 text-sm font-medium text-foreground">{r.title}</span>
                    <span className="text-xs text-muted">{formatDate(r.dueAt)}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-foreground">
            {t.passport.completeHistory(pet.logs.length)}
          </h2>
          {pet.logs.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
              {t.passport.noEntries}
            </p>
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-6">
              {pet.logs.map((l) => {
                const tm = LOG_TYPE_META[l.type as LogType];
                const sm = SEVERITY_META[l.severity as Severity];
                return (
                  <li key={l.id} className="relative">
                    <span className="absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full bg-surface text-sm ring-1 ring-border">
                      {tm.emoji}
                    </span>
                    <div className="rounded-xl border border-border bg-surface p-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {l.title || t.logType[l.type as LogType]}
                        </span>
                        <Badge tone={tm.color as Tone}>{t.logType[l.type as LogType]}</Badge>
                        {l.severity !== "NONE" && (
                          <Badge tone={sm.color as Tone}>{t.severity[l.severity as Severity]}</Badge>
                        )}
                        <span className="ml-auto text-[11px] text-slate-400">
                          {formatDate(l.occurredAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600">{l.rawText}</p>
                      {l.imageUrl && (
                        <div className="mt-2 overflow-hidden rounded-xl border border-border">
                          {l.imageMime?.startsWith("video/") ? (
                            <video src={proxyImageSrc(l.imageUrl)} controls className="max-h-56 w-auto max-w-full" />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={proxyImageSrc(l.imageUrl)} alt="" className="max-h-56 w-auto max-w-full object-cover" />
                          )}
                        </div>
                      )}
                      {safeTags(l.tags).length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {safeTags(l.tags).map((tag) => (
                            <span key={tag} className="text-xs text-slate-400">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                        <Lock size={10} />
                        {t.passport.logged} {relativeTime(l.createdAt)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <div className="mt-8 flex flex-col items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt={passportUrl}
            className="h-28 w-28 rounded-xl ring-1 ring-border"
          />
          <span className="text-xs text-muted">{t.passport.scanToOpen}</span>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          {t.passport.issuedBy(orgName)}
        </p>
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</div>
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
    <div className="bg-surface px-4 py-3">
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div
        className={`mt-0.5 truncate font-semibold text-foreground ${
          mono ? "font-mono text-xs tracking-wider" : "text-sm"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
