"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Lock } from "lucide-react";
import { PetAvatar } from "@/components/ui";
import { PetTabsInteractive } from "@/components/PetTabsInteractive";
import { petAge } from "@/lib/format";
import { useI18n } from "@/lib/i18n/client";
import type { PetLogSubTabId, PetMainTabId } from "@/components/pet-tab-model";
import type { PreviewPetRecord } from "@/lib/dashboard-preview-data";
import { PreviewPetTabPanels } from "./PreviewPetTabPanels";

type Role = "owner" | "shop" | "facility";

export function PreviewPetWorkspace({
  role,
  pet,
  onBack,
  onUrlChange,
}: {
  role: Role;
  pet: PreviewPetRecord;
  onBack: () => void;
  onUrlChange: (url: string) => void;
}) {
  const { t } = useI18n();
  const [mainTab, setMainTab] = useState<PetMainTabId>("logs");
  const [logSubTab, setLogSubTab] = useState<PetLogSubTabId>("quick");

  const tabOptions = {
    includeCheckin: role === "owner",
    includeTransfer: role === "shop",
    includeAI: true,
    includeTriage: true,
  };

  useEffect(() => {
    const base =
      role === "owner"
        ? `pethealthos.online/me/pets/${pet.name.toLowerCase()}`
        : `pethealthos.online/app/pets/${pet.name.toLowerCase()}`;
    if (mainTab === "logs") {
      onUrlChange(
        logSubTab === "health"
          ? `${base}/health`
          : logSubTab === "food"
          ? `${base}/food`
          : logSubTab === "activity"
            ? `${base}/activity`
            : logSubTab === "medication"
              ? `${base}/medication`
              : base,
      );
    } else {
      onUrlChange(`${base}/${mainTab}`);
    }
  }, [role, pet.name, mainTab, logSubTab, onUrlChange]);

  const backLabel =
    role === "owner"
      ? t.me.yourPets
      : role === "facility"
        ? t.facility.tabActive
        : t.dashboard.overview;

  const ageLabel = pet.birthDate ? petAge(pet.birthDate) : "";

  return (
    <div className="px-4 py-4 sm:px-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-brand-700"
      >
        <ChevronLeft size={14} /> {backLabel}
      </button>

      <div className="mt-3 flex items-center gap-3">
        <PetAvatar species={pet.species} name={pet.name} size="lg" photoUrl={pet.photoUrl} />
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-forest">{pet.name}</h2>
          <p className="text-[11px] text-muted">
            {pet.breed || (pet.species === "DOG" ? t.species.DOG : t.species.CAT)}
            {ageLabel ? ` · ${ageLabel}` : ""}
          </p>
        </div>
      </div>

      {role === "owner" && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50/50 p-3 text-[10px] text-brand-800">
          <Lock size={12} className="mt-0.5 shrink-0" />
          {t.me.selfPetNote}
        </div>
      )}

      <div className="mt-4">
        <PetTabsInteractive
          compact
          activeMain={mainTab}
          activeLogSub={logSubTab}
          onMainChange={setMainTab}
          onLogSubChange={setLogSubTab}
          options={tabOptions}
        />
      </div>

      <div className="mt-4">
        <PreviewPetTabPanels role={role} pet={pet} mainTab={mainTab} logSubTab={logSubTab} />
      </div>
    </div>
  );
}
