import Link from "next/link";
import { PawPrint, Plus, UserCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPets, getUserNotifications } from "@/lib/data";
import { Card, Badge, EmptyState, PetAvatar, Tone } from "@/components/ui";
import { NotificationList } from "@/components/NotificationList";
import { OwnerScanCard } from "@/components/OwnerScanCard";
import { PetStatus } from "@/lib/constants";
import { petAge } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";
import { EmailVerifiedBanner } from "@/components/EmailVerifiedBanner";

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "emerald",
  UNDER_OBSERVATION: "amber",
  TRANSFERRED: "brand",
  ARCHIVED: "slate",
};

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

  return (
    <div className="space-y-8">
      {showVerified && (
        <EmailVerifiedBanner message={t.verifyEmail.confirmedBanner} />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t.me.greeting(user.name)}
          </h1>
          <p className="mt-1 text-sm text-muted">{t.me.subtitle}</p>
        </div>
        <Link
          href="/me/account"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
        >
          <UserCircle size={13} /> {t.account.nav}
        </Link>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t.me.yourPets}</h2>
          <Link
            href="/me/pets/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus size={14} /> {t.me.addPet}
          </Link>
        </div>
        {pets.length === 0 ? (
          <EmptyState
            icon={<PawPrint size={22} />}
            title={t.me.noPetsTitle}
            description={t.me.noPetsDesc}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pets.map((pet) => (
              <Link key={pet.id} href={`/me/pets/${pet.id}`}>
                <Card className="flex items-center gap-3 p-4 transition hover:border-brand-300">
                  <PetAvatar
                    species={pet.species}
                    name={pet.name}
                    photoUrl={pet.photoUrl}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {pet.name}
                    </div>
                    <div className="truncate text-xs text-muted">
                      {pet.breed ||
                        (pet.species === "DOG" ? t.species.DOG : t.species.CAT)}
                      {pet.birthDate ? ` · ${petAge(pet.birthDate)}` : ""}
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[pet.status] ?? "slate"}>
                    {t.status[pet.status as PetStatus]}
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <OwnerScanCard />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t.notifications.title}
        </h2>
        <NotificationList notifications={notifications} basePetHref="/me/pets" />
      </section>
    </div>
  );
}
