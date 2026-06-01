import Link from "next/link";
import { PawPrint } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOwnedPets, getUserNotifications } from "@/lib/data";
import { Card, Badge, EmptyState, PetAvatar, Tone } from "@/components/ui";
import { NotificationList } from "@/components/NotificationList";
import { PetStatus } from "@/lib/constants";
import { petAge } from "@/lib/format";
import { getI18n } from "@/lib/i18n/server";

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "emerald",
  UNDER_OBSERVATION: "amber",
  TRANSFERRED: "brand",
  ARCHIVED: "slate",
};

export default async function MeHome() {
  const user = await getCurrentUser();
  if (!user) return null;
  const { t } = await getI18n();
  const [pets, notifications] = await Promise.all([
    getOwnedPets(user.id),
    getUserNotifications(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t.me.greeting(user.name)}
        </h1>
        <p className="mt-1 text-sm text-muted">{t.me.subtitle}</p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t.me.yourPets}
        </h2>
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
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          {t.notifications.title}
        </h2>
        <NotificationList notifications={notifications} basePetHref="/me/pets" />
      </section>
    </div>
  );
}
