"use client";

import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import { PetAvatar } from "@/components/ui";
import { PetPhotoUpload } from "@/components/PetPhotoUpload";
import { PetTabs } from "@/components/PetTabs";
import {
  MotionPop,
  MotionReveal,
  motionCardHover,
} from "./DashboardMotion";

export function OwnerPetChrome({
  petId,
  name,
  species,
  breed,
  birthDateLabel,
  photoUrl,
  ownershipNote,
  readOnly,
  canEditPhoto,
  backLabel,
  readOnlyBanner,
  children,
}: {
  petId: string;
  name: string;
  species: string;
  breed: string | null;
  birthDateLabel: string;
  photoUrl: string | null;
  ownershipNote: string;
  readOnly: boolean;
  canEditPhoto: boolean;
  backLabel: string;
  readOnlyBanner: string;
  children: React.ReactNode;
}) {
  const subtitle = [breed, birthDateLabel].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6 py-8">
      <MotionPop index={0}>
        <Link
          href="/me"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-brand-700"
        >
          <ChevronLeft size={15} /> {backLabel}
        </Link>
      </MotionPop>

      <MotionPop index={1}>
        <div className="flex items-center gap-4">
          {canEditPhoto ? (
            <PetPhotoUpload
              petId={petId}
              species={species}
              name={name}
              photoUrl={photoUrl}
            />
          ) : (
            <PetAvatar species={species} name={name} size="lg" photoUrl={photoUrl} />
          )}
          <div className="min-w-0">
            <h1 className="text-3xl font-extrabold tracking-tight text-forest">{name}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
      </MotionPop>

      <MotionReveal delay={80}>
        <div
          className={`flex items-start gap-2 rounded-2xl border border-brand-200 bg-brand-50/50 p-4 text-xs text-brand-800 shadow-soft ${motionCardHover}`}
        >
          <Lock size={14} className="mt-0.5 shrink-0" />
          {ownershipNote}
        </div>
      </MotionReveal>

      {readOnly && (
        <MotionReveal delay={120}>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-soft">
            {readOnlyBanner}
          </div>
        </MotionReveal>
      )}

      <MotionReveal delay={160}>
        <PetTabs
          petId={petId}
          base={`/me/pets/${petId}`}
          includeTransfer={false}
          readOnly={readOnly}
        />
      </MotionReveal>

      <div>{children}</div>
    </div>
  );
}
