import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet, getPetEntitlements } from "@/lib/data";
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
  };
}

export default async function EditOwnerPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { t } = await getI18n();

  const pet = await getOwnedPet(user.id, id);
  if (!pet) notFound();
  if (pet.status === "DECEASED") notFound();

  const ent = await getPetEntitlements(id);
  if (ent?.tier === "readonly") notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/me/pets/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft size={16} /> {t.me.backToPets}
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
        {t.editPet.title}
      </h1>
      <p className="mt-1 text-sm text-muted">{t.editPet.subtitle(pet.name)}</p>
      <div className="mt-6">
        <EditPetForm
          petId={id}
          initial={serializePet(pet)}
          variant="owner"
          returnHref={`/me/pets/${id}`}
        />
      </div>
    </div>
  );
}
