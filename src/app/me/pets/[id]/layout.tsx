import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Lock } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPet } from "@/lib/data";
import { PetAvatar } from "@/components/ui";
import { PetTabs } from "@/components/PetTabs";
import { petAge } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

export default async function MePetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();
  const { t } = await getI18n();
  const pet = await getOwnedPet(user.id, id);
  if (!pet) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/me"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand-600"
      >
        <ChevronLeft size={15} /> {t.me.backToPets}
      </Link>

      <div className="flex items-center gap-4">
        <PetAvatar species={pet.species} name={pet.name} size="lg" photoUrl={pet.photoUrl} />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {pet.name}
          </h1>
          <p className="text-sm text-muted">
            {pet.breed || (pet.species === "DOG" ? t.species.DOG : t.species.CAT)}
            {pet.birthDate ? ` · ${petAge(pet.birthDate)}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50/50 p-3 text-xs text-brand-800">
        <Lock size={14} className="mt-0.5 shrink-0" />
        {pet.org ? t.me.continueNote(pet.org.name) : t.me.selfPetNote}
      </div>

      <PetTabs petId={pet.id} base={`/me/pets/${pet.id}`} includeTransfer={false} />

      <div>{children}</div>
    </div>
  );
}
