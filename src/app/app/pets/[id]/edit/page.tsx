import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  getActiveOrg,
  isFacilityOrg,
  getPetEntitlements,
  getCandidateParents,
} from "@/lib/data";
import { EditPetForm, type PetProfileInitial } from "@/components/EditPetForm";
import { getI18n } from "@/lib/i18n/server";

function serializePet(pet: {
  name: string;
  species: string;
  breed: string | null;
  sex: string | null;
  color: string | null;
  birthDate: Date | null;
  intakeAt: Date | null;
  weightKg: number | null;
  notes: string | null;
  litterName: string | null;
  sireId: string | null;
  damId: string | null;
}): PetProfileInitial {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.sex,
    color: pet.color,
    birthDate: pet.birthDate?.toISOString() ?? null,
    intakeAt: pet.intakeAt?.toISOString() ?? null,
    weightKg: pet.weightKg,
    notes: pet.notes,
    litterName: pet.litterName,
    sireId: pet.sireId,
    damId: pet.damId,
  };
}

export default async function EditShopPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { t } = await getI18n();
  const org = await getActiveOrg();
  if (!org || isFacilityOrg(org)) notFound();

  const pet = await prisma.pet.findUnique({ where: { id } });
  if (!pet || pet.orgId !== org.id) notFound();

  const ent = await getPetEntitlements(id);
  if (ent?.tier === "readonly") notFound();

  const parents = await getCandidateParents(pet.species, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/app/pets/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft size={16} /> {t.petDetail.back}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {t.editPet.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{t.editPet.subtitle(pet.name)}</p>
      <div className="mt-6">
        <EditPetForm
          petId={id}
          initial={serializePet(pet)}
          variant="shop"
          parents={parents}
          returnHref={`/app/pets/${id}`}
        />
      </div>
    </div>
  );
}
