import { notFound } from "next/navigation";
import { Link2, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import { TransferForm } from "@/components/TransferForm";
import { formatDate } from "@/lib/format";

export default async function TransferPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: { transfers: { orderBy: { createdAt: "desc" } } },
  });
  if (!pet) notFound();

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-brand-600" />
          <h2 className="text-lg font-semibold text-foreground">Health passport transfer</h2>
        </div>
        <p className="mt-1.5 text-sm text-muted">
          When {pet.name} is sold or adopted, hand the new owner a complete,
          read-only health record. They get the full history from day one — and
          you reduce liability with a transparent paper trail.
        </p>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-sm text-brand-900">
        The passport includes: profile details, the full health log timeline,
        vaccination &amp; medication history, and upcoming reminders. It does
        <strong> not</strong> include internal AI conversations.
      </div>

      <TransferForm petId={pet.id} />

      {pet.transfers.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-semibold text-foreground">Issued passports</h3>
          <Card className="divide-y divide-border">
            {pet.transfers.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3.5">
                <Link2 size={16} className="shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">
                    {t.newOwnerName || "Unnamed recipient"}
                    {t.newOwnerEmail ? ` · ${t.newOwnerEmail}` : ""}
                  </div>
                  <a
                    href={`/passport/${t.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-xs text-brand-600 hover:underline"
                  >
                    /passport/{t.token}
                  </a>
                </div>
                <Badge tone={t.claimedAt ? "emerald" : "slate"}>
                  {t.claimedAt ? "Claimed" : "Issued"} · {formatDate(t.createdAt)}
                </Badge>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
