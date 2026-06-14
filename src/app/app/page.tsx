import {
  getActivePetsWithStats,
  getUpcomingReminders,
  requireActiveOrg,
  isFacilityOrg,
  getFacilityPets,
  getFacilityCapacity,
} from "@/lib/data";
import { SEVERITY_META, Severity } from "@/lib/constants";
import { getI18n } from "@/lib/i18n/server";
import { EmailVerifiedBanner } from "@/components/EmailVerifiedBanner";
import { ShopHomeView } from "@/components/dashboard/ShopHomeView";
import { FacilityHomeView } from "@/components/dashboard/FacilityHomeView";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const org = await requireActiveOrg();
  const params = await searchParams;
  const showVerified = params.verified === "1";
  const { t } = await getI18n();

  if (isFacilityOrg(org)) {
    const [capacity, stays] = await Promise.all([
      getFacilityCapacity(),
      getFacilityPets("ACTIVE"),
    ]);
    const pets = stays.map(({ pet }) => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      photoUrl: pet.photoUrl,
      birthDate: pet.birthDate ? pet.birthDate.toISOString() : null,
      logCount: pet._count.logs,
      last: pet.logs[0]
        ? {
            title: pet.logs[0].title,
            rawText: pet.logs[0].rawText,
            severity: pet.logs[0].severity,
            occurredAt: pet.logs[0].occurredAt.toISOString(),
          }
        : null,
    }));

    return (
      <>
        {showVerified && (
          <div className="mb-6">
            <EmailVerifiedBanner message={t.verifyEmail.confirmedBanner} />
          </div>
        )}
        <FacilityHomeView
          orgName={org.name}
          inCare={capacity.inCare}
          capacityLimit={capacity.limit}
          pets={pets}
        />
      </>
    );
  }

  const [pets, reminders] = await Promise.all([
    getActivePetsWithStats(),
    getUpcomingReminders(),
  ]);

  const now = Date.now();
  const twoWeeks = 1000 * 60 * 60 * 24 * 14;
  const attentionIds = new Set(
    pets
      .filter((p) => {
        const last = p.logs[0];
        const recent = last && now - last.occurredAt.getTime() < twoWeeks;
        const sev = last ? SEVERITY_META[last.severity as Severity].rank : 0;
        return p.status === "UNDER_OBSERVATION" || (recent && sev >= 3);
      })
      .map((p) => p.id),
  );

  const serializePet = (p: (typeof pets)[number]) => ({
    id: p.id,
    name: p.name,
    species: p.species,
    breed: p.breed,
    birthDate: p.birthDate ? p.birthDate.toISOString() : null,
    status: p.status,
    photoUrl: p.photoUrl,
    logCount: p._count.logs,
    last: p.logs[0]
      ? {
          title: p.logs[0].title,
          rawText: p.logs[0].rawText,
          severity: p.logs[0].severity,
          type: p.logs[0].type,
        }
      : null,
  });

  const petItems = pets.map(serializePet);
  const attentionItems = pets.filter((p) => attentionIds.has(p.id)).map(serializePet);
  const reminderItems = reminders.map((r) => ({
    id: r.id,
    petId: r.petId,
    title: r.title,
    category: r.category,
    dueAt: r.dueAt.toISOString(),
    pet: { name: r.pet.name },
  }));

  return (
    <>
      {showVerified && (
        <div className="mb-6">
          <EmailVerifiedBanner message={t.verifyEmail.confirmedBanner} />
        </div>
      )}
      <ShopHomeView
        orgName={org.name}
        pets={petItems}
        attention={attentionItems}
        reminders={reminderItems}
      />
    </>
  );
}
