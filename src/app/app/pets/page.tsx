import Link from "next/link";
import { Plus } from "lucide-react";
import { getActivePetsWithStats, getArchivedPetsWithStats } from "@/lib/data";
import { PetsList } from "@/components/PetsList";
import { getI18n } from "@/lib/i18n/server";

function serializePets(
  pets: Awaited<ReturnType<typeof getActivePetsWithStats>>,
) {
  return pets.map((p) => ({
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
}

export default async function PetsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const archived = tab === "archived";
  const { t } = await getI18n();
  const [activePets, archivedPets] = await Promise.all([
    getActivePetsWithStats(),
    getArchivedPetsWithStats(),
  ]);
  const pets = archived ? archivedPets : activePets;
  const items = serializePets(pets);

  const tabCls = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
      active ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:text-foreground"
    }`;

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 md:px-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t.pets.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {archived
              ? t.pets.archivedCount(archivedPets.length)
              : t.pets.inYourCare(activePets.length)}
          </p>
        </div>
        {!archived && (
          <Link
            href="/app/pets/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <Plus size={16} /> {t.common.addPet}
          </Link>
        )}
      </header>

      <div className="mt-5 flex rounded-xl border border-border bg-surface p-1 w-fit">
        <Link href="/app/pets" className={tabCls(!archived)}>
          {t.pets.tabActive} ({activePets.length})
        </Link>
        <Link href="/app/pets?tab=archived" className={tabCls(archived)}>
          {t.pets.tabArchived} ({archivedPets.length})
        </Link>
      </div>

      <div className="mt-6">
        <PetsList
          pets={items}
          emptyTitle={archived ? t.pets.noArchived : t.pets.noPetsFound}
          emptyDescription={archived ? t.pets.noArchivedDesc : t.pets.addFirst}
          showAddAction={!archived}
        />
      </div>
    </div>
  );
}
