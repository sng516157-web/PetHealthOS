"use client";

import Link from "next/link";
import { ArrowRight, QrCode, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { petAge } from "@/lib/format";
import { Badge, EmptyState, PetAvatar, Tone } from "@/components/ui";
import { AdmitScanner } from "@/components/AdmitScanner";
import { Severity } from "@/lib/constants";
import { SEVERITY_META } from "@/lib/constants";
import {
  DashboardCanvas,
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "./DashboardMotion";

type FacilityPet = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  photoUrl: string | null;
  birthDate: string | null;
  logCount: number;
  last: {
    title: string | null;
    rawText: string;
    severity: string;
    occurredAt: string;
  } | null;
};

export function FacilityHomeView({
  orgName,
  inCare,
  capacityLimit,
  pets,
}: {
  orgName: string;
  inCare: number;
  capacityLimit: number;
  pets: FacilityPet[];
}) {
  const { t } = useI18n();
  const pct = capacityLimit > 0 ? Math.min(100, (inCare / capacityLimit) * 100) : 0;

  return (
    <DashboardCanvas>
      <MotionPop index={0}>
        <div className="flex flex-wrap items-end justify-between gap-6 rounded-3xl border border-brand-200 bg-gradient-to-r from-brand-50/90 via-surface to-sand/30 p-6 shadow-soft lg:p-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-forest">
              <Sparkles size={13} /> {t.facility.inCareTitle}
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-forest">{orgName}</h1>
            <p className="mt-1 max-w-lg text-sm text-muted">{t.facility.admitDesc}</p>
          </div>
          <AdmitScanner />
        </div>
      </MotionPop>

      <MotionReveal delay={100} className="mt-6">
        <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 shadow-soft">
          <div>
            <p className="text-2xl font-bold text-forest">
              {inCare}{" "}
              <span className="text-base font-normal text-muted">/ {capacityLimit}</span>
            </p>
            <p className="text-xs text-muted">
              {t.facility.slotsStatus(inCare, capacityLimit)}
            </p>
          </div>
          <div className="h-2 min-w-[200px] flex-1 overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </MotionReveal>

      <MotionReveal delay={160} className="mt-8">
        <h2 className="text-sm font-semibold text-forest">{t.facility.tabActive}</h2>
      </MotionReveal>

      {pets.length === 0 ? (
        <MotionReveal delay={200} className="mt-4">
          <EmptyState
            icon={<QrCode size={22} />}
            title={t.facility.noActive}
            description={t.facility.noActiveDesc}
          />
        </MotionReveal>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pets.map((pet, i) => (
            <MotionReveal key={pet.id} delay={200 + i * 80}>
              <Link href={`/app/pets/${pet.id}`}>
                <div
                  className={`flex h-full flex-col rounded-2xl border border-border bg-surface p-5 shadow-soft ${motionCardHover}`}
                >
                  <div className="flex items-center gap-3">
                    <PetAvatar species={pet.species} name={pet.name} photoUrl={pet.photoUrl} />
                    <div className="min-w-0">
                      <p className="font-semibold text-forest">{pet.name}</p>
                      <p className="truncate text-xs text-muted">
                        {pet.breed ||
                          (pet.species === "DOG" ? t.species.DOG : t.species.CAT)}
                        {pet.birthDate ? ` · ${petAge(pet.birthDate)}` : ""}
                      </p>
                    </div>
                  </div>
                  {pet.last ? (
                    <div className="mt-4 flex-1 space-y-2">
                      <Badge
                        tone={SEVERITY_META[pet.last.severity as Severity].color as Tone}
                      >
                        {t.severity[pet.last.severity as Severity]}
                      </Badge>
                      <p className="text-sm leading-relaxed text-ink/70 line-clamp-2">
                        {pet.last.title || pet.last.rawText}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 flex-1 text-sm text-muted">{t.pets.noEntriesYet}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {pet.logCount} {t.dashboard.statLogs.toLowerCase()}
                    </span>
                    <span className="inline-flex items-center gap-0.5 font-semibold text-brand-700">
                      Open <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            </MotionReveal>
          ))}
        </div>
      )}

      <MotionReveal delay={400} className="mt-8">
        <Link
          href="/app/pets?tab=archived"
          className="text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          {t.facility.tabArchived} →
        </Link>
      </MotionReveal>
    </DashboardCanvas>
  );
}
