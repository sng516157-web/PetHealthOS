import { notFound } from "next/navigation";
import { HeartPulse, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, PetAvatar, Tone } from "@/components/ui";
import {
  LOG_TYPE_META,
  SEVERITY_META,
  REMINDER_CATEGORY_META,
  LogType,
  Severity,
  ReminderCategory,
} from "@/lib/constants";
import { petAge, formatDate } from "@/lib/format";
import { safeTags } from "@/lib/ai";
import { ATTACHMENT_KIND_META, AttachmentKind } from "@/lib/constants";

export default async function PassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
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

  if (!transfer.claimedAt) {
    await prisma.transfer.update({
      where: { id: transfer.id },
      data: { claimedAt: new Date() },
    });
  }

  const pet = transfer.pet;
  const meta = [
    pet.breed,
    pet.sex && pet.sex !== "UNKNOWN" ? pet.sex.toLowerCase() : null,
    petAge(pet.birthDate),
    pet.weightKg ? `${pet.weightKg} kg` : null,
    pet.color,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
            <HeartPulse size={18} />
          </div>
          <span className="text-sm font-semibold text-foreground">Pet Health Passport</span>
          <Badge tone="brand" className="ml-auto">
            <ShieldCheck size={12} /> Verified record
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        <div className="mb-6 overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100/50 p-6 text-center">
          <div className="text-3xl">🎉</div>
          <h2 className="mt-2 text-lg font-semibold text-brand-900">
            {transfer.newOwnerName
              ? `Welcome to the family, ${transfer.newOwnerName}!`
              : "Welcome to the family!"}
          </h2>
          <p className="mt-1 text-sm text-brand-800">
            {pet.name}&apos;s complete health history travels with them. Here it is.
          </p>
          {transfer.visibility === "SHARED" && (
            <span className="mt-2 inline-block rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-medium text-brand-700 ring-1 ring-inset ring-brand-200">
              Shared record with {pet.org.name}
            </span>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6">
          <div className="flex items-center gap-4">
            <PetAvatar species={pet.species} name={pet.name} size="lg" photoUrl={pet.photoUrl} />
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{pet.name}</h1>
              <p className="mt-1 text-sm capitalize text-muted">
                {(pet.species === "DOG" ? "Dog" : "Cat") +
                  (meta.length ? " · " + meta.join(" · ") : "")}
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            <Field label="Microchip" value={pet.microchip || "—"} />
            <Field label="Intake date" value={formatDate(pet.intakeAt)} />
            <Field label="From" value={pet.org.name} />
            {(pet.sire || pet.dam) && (
              <Field
                label="Parents"
                value={[pet.sire?.name, pet.dam?.name].filter(Boolean).join(" × ") || "—"}
              />
            )}
          </div>
          {transfer.note && (
            <div className="mt-4 rounded-xl bg-brand-50/60 p-3 text-sm text-brand-900">
              <span className="font-medium">Note: </span>
              {transfer.note}
            </div>
          )}
        </div>

        {pet.attachments.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-sm font-semibold text-foreground">Documents</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {pet.attachments.map((a) => {
                const m = ATTACHMENT_KIND_META[a.kind as AttachmentKind];
                const img =
                  a.mimeType?.startsWith("image/") ||
                  /\.(png|jpe?g|gif|webp|svg)$/i.test(a.url);
                return (
                  <a
                    key={a.id}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-border bg-surface transition hover:shadow-md"
                  >
                    {img ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.url} alt={a.label} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center bg-slate-50 text-3xl">
                        📄
                      </div>
                    )}
                    <div className="p-2.5">
                      <div className="truncate text-sm font-medium text-foreground">{a.label}</div>
                      <div className="text-xs text-muted">{m?.label}</div>
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
              Upcoming care
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
            Complete health history ({pet.logs.length})
          </h2>
          {pet.logs.length === 0 ? (
            <p className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted">
              No entries recorded.
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
                          {l.title || tm.label}
                        </span>
                        <Badge tone={tm.color as Tone}>{tm.label}</Badge>
                        {l.severity !== "NONE" && (
                          <Badge tone={sm.color as Tone}>{sm.label}</Badge>
                        )}
                        <span className="ml-auto text-[11px] text-slate-400">
                          {formatDate(l.occurredAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-600">{l.rawText}</p>
                      {safeTags(l.tags).length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {safeTags(l.tags).map((t) => (
                            <span key={t} className="text-xs text-slate-400">#{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <p className="mt-8 text-center text-xs text-muted">
          Issued by {pet.org.name} via Pet Health OS · Read-only record
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
