"use client";

import Link from "next/link";
import { Activity, Bell, PawPrint, Plus, Sparkles, UserCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { petAge } from "@/lib/format";
import { Badge, EmptyState, PetAvatar, Tone } from "@/components/ui";
import { NotificationList } from "@/components/NotificationList";
import { OwnerScanCard } from "@/components/OwnerScanCard";
import { PetStatus } from "@/lib/constants";
import {
  DashboardCanvas,
  DashboardStatCard,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "./DashboardMotion";

const STATUS_TONE: Record<string, Tone> = {
  ACTIVE: "emerald",
  UNDER_OBSERVATION: "amber",
  TRANSFERRED: "brand",
  ARCHIVED: "slate",
};

type OwnerPet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  status: string;
  photoUrl: string | null;
};

type OwnerNotif = {
  id: string;
  title: string;
  body: string | null;
  kind: string;
  readAt: Date | string | null;
  createdAt: Date | string;
  dueAt: Date | string | null;
  pet: { id: string; name: string; species: string } | null;
};

export function OwnerHomeView({
  userName,
  pets,
  notifications,
}: {
  userName: string;
  pets: OwnerPet[];
  notifications: OwnerNotif[];
}) {
  const { t } = useI18n();
  const unread = notifications.filter((n) => !n.readAt).length;
  const watchCount = pets.filter((p) => p.status === "UNDER_OBSERVATION").length;

  return (
    <DashboardCanvas>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <MotionPop index={0}>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white/90 px-3 py-1 text-xs font-medium text-forest">
            <Sparkles size={13} /> {t.me.subtitle}
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-forest lg:text-4xl">
            {t.me.greeting(userName)}
          </h1>
          <p className="mt-1 text-sm text-muted">{t.me.subtitle}</p>
        </MotionPop>
        <MotionPop index={1}>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/me/pets/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
            >
              <Plus size={16} /> {t.me.addPet}
            </Link>
            <Link
              href="/me/account"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-forest transition hover:border-brand-300"
            >
              <UserCircle size={16} /> {t.account.nav}
            </Link>
          </div>
        </MotionPop>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <DashboardStatCard
          delay={0}
          icon={<PawPrint size={18} />}
          label={t.dashboard.statPets}
          value={pets.length}
          toneClass="bg-brand-50 text-brand-600"
        />
        <DashboardStatCard
          delay={80}
          icon={<Bell size={18} />}
          label={t.notifications.title}
          value={unread}
          toneClass={unread ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}
        />
        <DashboardStatCard
          delay={160}
          icon={<Activity size={18} />}
          label={t.dashboard.statAttention}
          value={watchCount}
          toneClass={watchCount ? "bg-orange-50 text-orange-600" : "bg-emerald-50 text-emerald-600"}
        />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <MotionReveal>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-forest">{t.me.yourPets}</h2>
              {pets.length > 0 && (
                <Link
                  href="/me/pets/new"
                  className="text-xs font-medium text-brand-700 hover:text-brand-800"
                >
                  {t.me.addPet}
                </Link>
              )}
            </div>
          </MotionReveal>

          {pets.length === 0 ? (
            <MotionReveal delay={80}>
              <EmptyState
                icon={<PawPrint size={22} />}
                title={t.me.noPetsTitle}
                description={t.me.noPetsDesc}
              />
            </MotionReveal>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pets.map((pet, i) => (
                <MotionReveal key={pet.id} delay={i * 90}>
                  <Link href={`/me/pets/${pet.id}`}>
                    <div
                      className={`flex h-full flex-col rounded-2xl border border-border bg-surface p-4 shadow-soft ${motionCardHover}`}
                    >
                      <div className="flex items-center gap-3">
                        <PetAvatar
                          species={pet.species}
                          name={pet.name}
                          photoUrl={pet.photoUrl}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-forest">{pet.name}</p>
                          <p className="truncate text-xs text-muted">
                            {pet.breed ||
                              (pet.species === "DOG" ? t.species.DOG : t.species.CAT)}
                            {pet.birthDate ? ` · ${petAge(pet.birthDate)}` : ""}
                          </p>
                        </div>
                      </div>
                      <Badge
                        tone={STATUS_TONE[pet.status] ?? "slate"}
                        className="mt-3 w-fit"
                      >
                        {t.status[pet.status as PetStatus]}
                      </Badge>
                    </div>
                  </Link>
                </MotionReveal>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 xl:col-span-4">
          <MotionReveal delay={120}>
            <div
              className={`overflow-hidden rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/80 to-surface shadow-soft ${motionCardHover}`}
            >
              <OwnerScanCard embedded />
            </div>
          </MotionReveal>

          <MotionReveal delay={180}>
            <div className="rounded-2xl border border-border bg-surface shadow-soft">
              <div className="border-b border-border px-4 py-3">
                <h2 className="text-sm font-semibold text-forest">{t.notifications.title}</h2>
              </div>
              <div className="p-4 pt-0">
                <NotificationList notifications={notifications} basePetHref="/me/pets" />
              </div>
            </div>
          </MotionReveal>
        </div>
      </div>
    </DashboardCanvas>
  );
}
