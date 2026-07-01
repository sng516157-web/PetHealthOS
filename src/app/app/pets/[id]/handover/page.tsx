import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { canAccessPet } from "@/lib/data";
import { proxyImageSrc } from "@/lib/img";
import { PetAvatar } from "@/components/ui";
import { LOG_TYPE_META, LogType } from "@/lib/constants";
import { petAge, formatDate } from "@/lib/format";
import { getTimezone } from "@/lib/timezone/server";
import { getI18n } from "@/lib/i18n/server";
import { PrintButton } from "@/components/PrintButton";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import type { Sex } from "@/lib/constants";

export default async function HandoverPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!(await canAccessPet(id))) notFound();

  const { t, locale } = await getI18n();
  const timeZone = await getTimezone();
  const fmt = { timeZone, locale };

  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      org: true,
      logs: { orderBy: { occurredAt: "desc" } },
      weights: { orderBy: { measuredAt: "desc" }, take: 20 },
      transfers: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });
  if (!pet) notFound();

  const transfer = pet.transfers[0];
  const orgName = pet.org?.name ?? t.common.appName;
  const meta = [
    pet.breed,
    pet.sex && pet.sex !== "UNKNOWN" ? t.sex[pet.sex as Sex] : null,
    petAge(pet.birthDate),
    pet.microchip ? `µ${pet.microchip}` : null,
    pet.color,
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white text-foreground print:text-black">
      <header className="no-print border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
          <Link href={`/app/pets/${id}/transfer`} className="text-sm text-muted hover:text-foreground">
            ← {t.handover.back}
          </Link>
          <div className="ml-auto">
            <PrintButton />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8 print:px-0 print:py-4">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <PawSureMarkTile className="h-10 w-10" />
          <div>
            <h1 className="text-lg font-bold text-forest">{t.handover.title}</h1>
            <p className="text-xs text-muted">{orgName}</p>
          </div>
        </div>

        <section className="mt-6 flex items-start gap-4">
          <PetAvatar species={pet.species} name={pet.name} photoUrl={proxyImageSrc(pet.photoUrl)} size="lg" />
          <div>
            <h2 className="text-2xl font-bold">{pet.name}</h2>
            <p className="text-sm text-muted">{meta.join(" · ")}</p>
            {transfer && (
              <p className="mt-2 text-xs text-muted">
                {t.handover.passportIssued(formatDate(transfer.createdAt, fmt))}
              </p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {t.handover.healthSummary}
          </h3>
          <table className="mt-3 w-full text-sm">
            <tbody>
              {pet.logs.map((log) => {
                const typeMeta = LOG_TYPE_META[log.type as LogType];
                return (
                  <tr key={log.id} className="border-b border-border/60">
                    <td className="py-2 pr-3 whitespace-nowrap text-muted">
                      {formatDate(log.occurredAt, fmt)}
                    </td>
                    <td className="py-2 pr-2">{typeMeta?.emoji}</td>
                    <td className="py-2">{log.title || log.rawText}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        {pet.weights.length > 0 && (
          <section className="mt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {t.handover.weightHistory}
            </h3>
            <p className="mt-2 text-sm">
              {pet.weights
                .map((w) => `${formatDate(w.measuredAt, fmt)}: ${w.weightKg} kg`)
                .join(" · ")}
            </p>
          </section>
        )}

        {transfer && (
          <p className="mt-8 text-center text-xs text-muted print:mt-12">
            {t.handover.qrNote} /passport/{transfer.token}
          </p>
        )}
      </main>
    </div>
  );
}
