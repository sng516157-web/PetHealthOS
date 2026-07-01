"use client";

import Link from "next/link";
import { ChevronLeft, Lock, Pencil } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { PetAvatar } from "@/components/ui";
import { PetPhotoUpload } from "@/components/PetPhotoUpload";
import { PetMicrochipField } from "@/components/PetMicrochipField";
import { PetTabs } from "@/components/PetTabs";
import {
  MotionPop,
  motionCardHover,
} from "./DashboardMotion";

export function OwnerPetChrome({
  petId,
  name,
  species,
  breed,
  birthDateLabel,
  photoUrl,
  microchip,
  canEditMicrochip,
  ownershipNote,
  readOnly,
  canEditPhoto,
  isMemorial = false,
  backLabel,
  backHref = "/me",
  readOnlyBanner,
  claimBanner,
  editHref,
  children,
}: {
  petId: string;
  name: string;
  species: string;
  breed: string | null;
  birthDateLabel: string;
  photoUrl: string | null;
  microchip: string | null;
  canEditMicrochip: boolean;
  ownershipNote: string;
  readOnly: boolean;
  canEditPhoto: boolean;
  isMemorial?: boolean;
  backLabel: string;
  backHref?: string;
  readOnlyBanner: string;
  claimBanner?: string | null;
  editHref?: string | null;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const subtitle = [breed, birthDateLabel].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6 py-8">
      <MotionPop index={0}>
        <Link
          href={backHref}
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
            <PetMicrochipField
              petId={petId}
              microchip={microchip}
              canEdit={canEditMicrochip}
            />
            {editHref && (
              <Link
                href={editHref}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800"
              >
                <Pencil size={13} /> {t.petDetail.editProfile}
              </Link>
            )}
          </div>
        </div>
      </MotionPop>

      <MotionPop index={2}>
        <div
          className={`flex items-start gap-2 rounded-2xl border border-brand-200 bg-brand-50/50 p-4 text-xs text-brand-800 shadow-soft ${motionCardHover}`}
        >
          <Lock size={14} className="mt-0.5 shrink-0" />
          {ownershipNote}
        </div>
      </MotionPop>

      {readOnly && (
        <MotionPop index={3}>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-soft">
            {readOnlyBanner}
          </div>
        </MotionPop>
      )}

      {claimBanner && (
        <MotionPop index={readOnly ? 4 : 3}>
          <div className="rounded-2xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm text-brand-900 shadow-soft">
            {claimBanner}
          </div>
        </MotionPop>
      )}

      <MotionPop index={readOnly && claimBanner ? 5 : readOnly || claimBanner ? 4 : 3}>
        <PetTabs
          petId={petId}
          base={`/me/pets/${petId}`}
          includeTransfer={false}
          includeCheckin={!isMemorial}
        />
      </MotionPop>

      <div>{children}</div>
    </div>
  );
}
