import Link from "next/link";
import { Plus } from "lucide-react";
import { getPetsWithStats } from "@/lib/data";
import { PetsList } from "@/components/PetsList";
import { getI18n } from "@/lib/i18n/server";

export default async function PetsPage() {
  const { t } = await getI18n();
  const pets = await getPetsWithStats();
  const items = pets.map((p) => ({
    id: p.id,
    name: p.name,
    species: p.species,
    breed: p.breed,
    status: p.status,
    photoUrl: p.photoUrl,
    birthDate: p.birthDate ? p.birthDate.toISOString() : null,
    logCount: p._count.logs,
    last: p.logs[0]
      ? {
          title: p.logs[0].title,
          rawText: p.logs[0].rawText,
          severity: p.logs[0].severity,
          occurredAt: p.logs[0].occurredAt.toISOString(),
        }
      : null,
  }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.pets.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.pets.inYourCare(pets.length)}</p>
        </div>
        <Link
          href="/pets/new"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          <Plus size={16} /> {t.common.addPet}
        </Link>
      </header>
      <div className="mt-6">
        <PetsList pets={items} />
      </div>
    </div>
  );
}
