import { notFound } from "next/navigation";
import { Link2, ShieldCheck, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import { TransferForm } from "@/components/TransferForm";
import { formatDate } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { transfers: { orderBy: { createdAt: "desc" } } },
  });
  if (!pet) notFound();

  // A passport can only be claimed once. If a new owner has already registered an
  // account through this pet's passport, the shop can't issue another one.
  const claimedTransfer = pet.transfers.find((tr) => tr.claimedAt);

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
                claimedTransfer.claimedByName || t.transferPage.unnamed,
                formatDate(claimedTransfer.claimedAt as Date),
              )}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-brand-900">
            {t.transferPage.includes}
            <strong> {t.transferPage.notInclude}</strong> {t.transferPage.includesEnd}
          </div>

          <TransferForm petId={pet.id} />
        </>
      )}

      {pet.transfers.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">{t.transferPage.issued}</h3>
          <Card className="divide-y divide-border">
            {pet.transfers.map((tr) => (
              <div key={tr.id} className="flex items-center gap-3 p-3.5">
                <Link2 size={16} className="shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {tr.newOwnerName || t.transferPage.unnamed}
                    {tr.newOwnerEmail ? ` · ${tr.newOwnerEmail}` : ""}
                  </div>
                  <a
                    href={`/passport/${tr.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs text-brand-600 hover:underline"
                  >
                    /passport/{tr.token}
                  </a>
                </div>
                <Badge tone={tr.claimedAt ? "emerald" : "slate"}>
                  {tr.claimedAt ? t.transferPage.claimed : t.transferPage.issuedBadge} · {formatDate(tr.createdAt)}
                </Badge>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
