import { getCurrentUser } from "@/lib/auth";
import { getOwnedPets, getOwnedMemorialPets, getUserNotifications } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { EmailVerifiedBanner } from "@/components/EmailVerifiedBanner";
import { OwnerHomeView } from "@/components/dashboard/OwnerHomeView";
import { getPendingDataImport } from "@/lib/data-import";
import { formatDate } from "@/lib/format";
import { getTimezone } from "@/lib/timezone/server";

export default async function MeHome({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string; tab?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { t, locale } = await getI18n();
  const timeZone = await getTimezone();
  const params = await searchParams;
  const showVerified = params.verified === "1";
  const memorialTab = params.tab === "memorial";
  const [pets, memorialPets, notifications, pendingImportRow] = await Promise.all([
    getOwnedPets(user.id),
    getOwnedMemorialPets(user.id),
    getUserNotifications(user.id),
    getPendingDataImport({ userId: user.id, orgId: null }),
  ]);

  const petItems = pets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    birthDate: pet.birthDate ? pet.birthDate.toISOString() : null,
    status: pet.status,
    photoUrl: pet.photoUrl,
  }));

  const memorialItems = memorialPets.map((pet) => ({
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    birthDate: pet.birthDate ? pet.birthDate.toISOString() : null,
    status: pet.status,
    photoUrl: pet.photoUrl,
    claimStatus: pet.deathClaim?.status ?? null,
  }));

  return (
    <>
      {showVerified && (
        <div className="mb-6">
          <EmailVerifiedBanner message={t.verifyEmail.confirmedBanner} />
        </div>
      )}
      <OwnerHomeView
        userName={user.name}
        pets={petItems}
        memorialPets={memorialItems}
        memorialTab={memorialTab && memorialItems.length > 0}
        notifications={notifications}
        pendingImport={
          pendingImportRow
            ? {
                id: pendingImportRow.id,
                status: pendingImportRow.status,
                submittedAt: formatDate(pendingImportRow.submittedAt, { timeZone, locale }),
              }
            : null
        }
      />
    </>
  );
}
