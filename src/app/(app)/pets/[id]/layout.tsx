import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Badge, PetAvatar, Tone } from "@/components/ui";
import { PetTabs } from "@/components/PetTabs";
import { petAge } from "@/lib/format";

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "emerald",
  UNDER_OBSERVATION: "amber",
  TRANSFERRED: "violet",
  ARCHIVED: "slate",
};
const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  UNDER_OBSERVATION: "Under observation",
  TRANSFERRED: "Transferred",
  ARCHIVED: "Archived",
};

export default async function PetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
    pet.sex && pet.sex !== "UNKNOWN" ? pet.sex.toLowerCase() : null,
    petAge(pet.birthDate),
    pet.weightKg ? `${pet.weightKg} kg` : null,
    pet.color,
  ].filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 md:px-8">
      <Link
        href="/pets"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft size={16} /> Pets
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <PetAvatar species={pet.species} name={pet.name} size="lg" photoUrl={pet.photoUrl} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{pet.name}</h1>
            <Badge tone={STATUS_TONE[pet.status] ?? "slate"} dot>
              {STATUS_LABEL[pet.status] ?? pet.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm capitalize text-muted">
            {(pet.species === "DOG" ? "Dog" : "Cat") + (meta.length ? " · " + meta.join(" · ") : "")}
          </p>
          {(pet.sire || pet.dam) && (
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
              {pet.sire && (
                <span>
                  Sire:{" "}
                  <Link href={`/pets/${pet.sire.id}`} className="font-medium text-brand-600 hover:underline">
                    {pet.sire.name}
                  </Link>
                </span>
              )}
              {pet.dam && (
                <span>
                  Dam:{" "}
                  <Link href={`/pets/${pet.dam.id}`} className="font-medium text-brand-600 hover:underline">
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
