import { getCurrentUser } from "@/lib/auth";
import { getOwnedPets, getUserNotifications } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";
import { EmailVerifiedBanner } from "@/components/EmailVerifiedBanner";
import { OwnerHomeView } from "@/components/dashboard/OwnerHomeView";

export default async function MeHome({
  searchParams,
}: {
  searchParams: Promise<{ verified?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;
  const { t } = await getI18n();
  const params = await searchParams;
  const showVerified = params.verified === "1";
  const [pets, notifications] = await Promise.all([
    getOwnedPets(user.id),
    getUserNotifications(user.id),
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

  return (
    <>
      {showVerified && (
        <div className="mb-6 pt-8">
          <EmailVerifiedBanner message={t.verifyEmail.confirmedBanner} />
        </div>
      )}
      {!showVerified && <div className="pt-8" />}
      <OwnerHomeView
        userName={user.name}
        pets={petItems}
        notifications={notifications}
      />
    </>
  );
}
