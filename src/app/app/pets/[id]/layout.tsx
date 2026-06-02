import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, Tone } from "@/components/ui";
import { PetTabs } from "@/components/PetTabs";
import { PetPhotoUpload } from "@/components/PetPhotoUpload";
import { petAge } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import type { PetStatus, Sex } from "@/lib/constants";

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "emerald",
  UNDER_OBSERVATION: "amber",
  TRANSFERRED: "violet",
  ARCHIVED: "slate",
};

export default async function PetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const pet = await prisma.pet.findUnique({
    where: { id },
    include: {
      sire: { select: { id: true, name: true } },
      dam: { select: { id: true, name: true } },
    },
  });
  if (!pet) notFound();

  const meta = [
    pet.breed,
    pet.sex && pet.sex !== "UNKNOWN" ? t.sex[pet.sex as Sex] : null,
    petAge(pet.birthDate),
    pet.weightKg ? `${pet.weightKg} kg` : null,
    pet.color,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <Link
        href="/app/pets"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft size={16} /> {t.petDetail.back}
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <PetPhotoUpload
          petId={pet.id}
          species={pet.species}
          name={pet.name}
          photoUrl={pet.photoUrl}
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{pet.name}</h1>
            <Badge tone={STATUS_TONE[pet.status] ?? "slate"} dot>
              {t.status[pet.status as PetStatus] ?? pet.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            {(pet.species === "DOG" ? t.species.DOG : t.species.CAT) + (meta.length ? " · " + meta.join(" · ") : "")}
          </p>
          {(pet.sire || pet.dam) && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {pet.sire && (
                <span>
                  {t.petDetail.sire}:{" "}
                  <Link href={`/app/pets/${pet.sire.id}`} className="font-medium text-brand-600 hover:underline">
                    {pet.sire.name}
                  </Link>
                </span>
              )}
              {pet.dam && (
                <span>
                  {t.petDetail.dam}:{" "}
                  <Link href={`/app/pets/${pet.dam.id}`} className="font-medium text-brand-600 hover:underline">
                    {pet.dam.name}
                  </Link>
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6">
        <PetTabs petId={pet.id} />
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}
