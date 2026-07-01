"use client";

import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { Badge, PetAvatar, Tone } from "@/components/ui";
import { PetTabs } from "@/components/PetTabs";
import { PetPhotoUpload } from "@/components/PetPhotoUpload";
import { PetMicrochipField } from "@/components/PetMicrochipField";
import { useI18n } from "@/lib/i18n/client";
import { MotionPop } from "./DashboardMotion";

export function AppPetChrome({
  petId,
  name,
  species,
  speciesLabel,
  metaLine,
  photoUrl,
  microchip,
  canEditMicrochip,
  facility,
  badgeLabel,
  badgeTone,
  readOnly,
  slotReadOnly,
  includeTransfer,
  includeAI = true,
  includeTriage = true,
  sire,
  dam,
  sireLabel,
  damLabel,
  backLabel,
  readOnlyBanner,
  editHref,
  children,
}: {
  petId: string;
  name: string;
  species: string;
  speciesLabel: string;
  metaLine: string;
  photoUrl: string | null;
  microchip: string | null;
  canEditMicrochip: boolean;
  facility: boolean;
  badgeLabel: string;
  badgeTone: Tone;
  readOnly: boolean;
  slotReadOnly: boolean;
  includeTransfer: boolean;
  includeAI?: boolean;
  includeTriage?: boolean;
  sire: { id: string; name: string } | null;
  dam: { id: string; name: string } | null;
  sireLabel: string;
  damLabel: string;
  backLabel: string;
  readOnlyBanner: string;
  editHref?: string | null;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  return (
    <div className="space-y-6 py-8">
      <MotionPop index={0}>
        <Link
          href="/app/pets"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-brand-700"
        >
          <ChevronLeft size={16} /> {backLabel}
        </Link>
      </MotionPop>

      <MotionPop index={1}>
        <div className="flex items-center gap-4">
          {facility ? (
            <PetAvatar species={species} name={name} size="lg" photoUrl={photoUrl} />
          ) : (
            <PetPhotoUpload
              petId={petId}
              species={species}
              name={name}
              photoUrl={photoUrl}
            />
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-3xl font-extrabold tracking-tight text-forest">{name}</h1>
              <Badge tone={badgeTone} dot>
                {badgeLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              {speciesLabel}
              {metaLine ? ` · ${metaLine}` : ""}
            </p>
            {!facility && (sire || dam) && (
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                {sire && (
                  <span>
                    {sireLabel}:{" "}
                    <Link
                      href={`/app/pets/${sire.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {sire.name}
                    </Link>
                  </span>
                )}
                {dam && (
                  <span>
                    {damLabel}:{" "}
                    <Link
                      href={`/app/pets/${dam.id}`}
                      className="font-medium text-brand-600 hover:underline"
                    >
                      {dam.name}
                    </Link>
                  </span>
                )}
              </p>
            )}
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

      {slotReadOnly && (
        <MotionPop index={2}>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-soft">
            {readOnlyBanner}
          </div>
        </MotionPop>
      )}

      <MotionPop index={slotReadOnly ? 3 : 2}>
        <PetTabs
          petId={petId}
          includeTransfer={includeTransfer}
          includeAI={includeAI}
          includeTriage={includeTriage}
        />
      </MotionPop>

      <div>{children}</div>
    </div>
  );
}
