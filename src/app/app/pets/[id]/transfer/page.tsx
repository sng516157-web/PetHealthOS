import { notFound } from "next/navigation";
import { Link2, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import { TransferForm } from "@/components/TransferForm";
import { BuyerPreviewCard } from "@/components/BuyerPreviewCard";
import { formatDate } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { getTimezone } from "@/lib/timezone/server";

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t, locale } = await getI18n();
  const timeZone = await getTimezone();
  const fmt = { timeZone, locale };
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { transfers: { orderBy: { createdAt: "desc" } } },
  });
  if (!pet) notFound();

  const transfer = pet.transfers[0] ?? null;
  const claimedTransfer = transfer?.claimedAt ? transfer : null;
  const pendingTransfer = transfer && !transfer.claimedAt ? transfer : null;

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-brand-600" />
          <h2 className="text-lg font-semibold text-foreground">{t.transferPage.title}</h2>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          {t.transferPage.subtitle(pet.name)}
        </p>
      </div>

      {claimedTransfer ? (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-semibold">{t.transferPage.alreadyClaimedTitle}</p>
            <p className="mt-0.5 text-emerald-800">
              {t.transferPage.alreadyClaimedDesc(
                claimedTransfer.claimedByName || t.transferPage.unnamedOwner,
                formatDate(claimedTransfer.claimedAt as Date, fmt),
              )}
            </p>
          </div>
        </div>
      ) : pendingTransfer ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Clock size={20} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">{t.transferPage.awaitingClaimTitle}</p>
            <p className="mt-0.5 text-amber-800">{t.transferPage.awaitingClaimDesc}</p>
            <a
              href={`/passport/${pendingTransfer.token}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              /passport/{pendingTransfer.token}
            </a>
          </div>
        </div>
      ) : (
        <>
          <BuyerPreviewCard
            petId={pet.id}
            petName={pet.name}
            initialToken={pet.previewToken}
          />

          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-brand-900">
            {t.transferPage.includes}
            <strong> {t.transferPage.notInclude}</strong> {t.transferPage.includesEnd}
          </div>

          <p className="text-sm">
            <a
              href={`/app/pets/${pet.id}/handover`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand-600 hover:underline"
            >
              {t.handover.printPdf}
            </a>
          </p>

          <TransferForm petId={pet.id} petName={pet.name} />
        </>
      )}

      {transfer && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">{t.transferPage.issued}</h3>
          <Card className="divide-y divide-border">
            <div className="flex items-center gap-3 p-3.5">
              <Link2 size={16} className="shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-foreground">
                  {transfer.claimedByName
                    ? t.transferPage.claimedBy(transfer.claimedByName)
                    : t.transferPage.awaitingOwner}
                </div>
                <a
                  href={`/passport/${transfer.token}`}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-xs text-brand-600 hover:underline"
                >
                  /passport/{transfer.token}
                </a>
              </div>
              <Badge tone={transfer.claimedAt ? "emerald" : "amber"}>
                {transfer.claimedAt ? t.transferPage.claimed : t.transferPage.issuedBadge} ·{" "}
                {formatDate(transfer.createdAt, fmt)}
              </Badge>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
