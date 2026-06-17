"use client";

import { useCallback, useEffect, useState } from "react";
import { MiniBackBar } from "@/components/landing/mini/MiniDashboardFrame";
import { OwnerHomeView } from "@/components/dashboard/OwnerHomeView";
import { ShopHomeView } from "@/components/dashboard/ShopHomeView";
import { FacilityHomeView } from "@/components/dashboard/FacilityHomeView";
import { OrgAiWorkspace } from "@/components/OrgAiWorkspace";
import {
  PREVIEW_FACILITY_CAPACITY,
  PREVIEW_FACILITY_ORG,
  PREVIEW_FACILITY_PETS,
  PREVIEW_ORG_WARD_TRIAGE,
  PREVIEW_OWNER_NOTIFICATIONS,
  PREVIEW_OWNER_PETS,
  PREVIEW_SHOP_ATTENTION,
  PREVIEW_SHOP_ORG,
  PREVIEW_SHOP_PETS,
  PREVIEW_SHOP_REMINDERS,
  PREVIEW_USER_NAME,
  findPreviewPet,
  previewWorkspacePath,
} from "@/lib/dashboard-preview-data";
import { PreviewPetWorkspace } from "./PreviewPetWorkspace";
import { useI18n } from "@/lib/i18n/client";

export function DashboardPreviewRole({
  role,
  onUrlChange,
}: {
  role: "owner" | "shop" | "facility";
  onUrlChange: (url: string) => void;
}) {
  const { t } = useI18n();
  const [petId, setPetId] = useState<string | null>(null);
  const [orgAi, setOrgAi] = useState(false);

  const handlePetSelect = useCallback((id: string) => {
    setOrgAi(false);
    setPetId(id);
  }, []);

  const handleOrgAiOpen = useCallback(() => {
    setPetId(null);
    setOrgAi(true);
  }, []);

  const handleBack = useCallback(() => {
    setPetId(null);
    setOrgAi(false);
  }, []);

  useEffect(() => {
    onUrlChange(previewWorkspacePath(role, { petId, orgAi }));
  }, [role, petId, orgAi, onUrlChange]);

  if (orgAi && role !== "owner") {
    return (
      <div className="px-2 py-2 sm:px-3">
        <MiniBackBar label={t.nav.dashboard} onBack={handleBack} />
        <OrgAiWorkspace
          facility={role === "facility"}
          petCount={role === "facility" ? PREVIEW_FACILITY_PETS.length : PREVIEW_SHOP_PETS.length}
          aiEnabled={false}
          preview
          previewReport={PREVIEW_ORG_WARD_TRIAGE}
        />
      </div>
    );
  }

  if (petId) {
    const pet = findPreviewPet(petId);
    if (!pet) {
      setPetId(null);
      return null;
    }
    return (
      <PreviewPetWorkspace
        role={role}
        pet={pet}
        onBack={handleBack}
        onUrlChange={onUrlChange}
      />
    );
  }

  if (role === "owner") {
    return (
      <div className="px-2 py-2 sm:px-3">
        <OwnerHomeView
          userName={PREVIEW_USER_NAME}
          pets={[...PREVIEW_OWNER_PETS]}
          memorialPets={[]}
          memorialTab={false}
          notifications={[...PREVIEW_OWNER_NOTIFICATIONS]}
          preview={{ onPetSelect: handlePetSelect }}
        />
      </div>
    );
  }

  if (role === "shop") {
    return (
      <div className="px-2 py-2 sm:px-3">
        <ShopHomeView
          orgName={PREVIEW_SHOP_ORG}
          pets={[...PREVIEW_SHOP_PETS]}
          attention={[...PREVIEW_SHOP_ATTENTION]}
          reminders={[...PREVIEW_SHOP_REMINDERS]}
          preview={{ onPetSelect: handlePetSelect, onOrgAiOpen: handleOrgAiOpen }}
        />
      </div>
    );
  }

  return (
    <div className="px-2 py-2 sm:px-3">
      <FacilityHomeView
        orgName={PREVIEW_FACILITY_ORG}
        inCare={PREVIEW_FACILITY_PETS.length}
        capacityLimit={PREVIEW_FACILITY_CAPACITY}
        pets={[...PREVIEW_FACILITY_PETS]}
        preview={{ onPetSelect: handlePetSelect, onOrgAiOpen: handleOrgAiOpen }}
      />
    </div>
  );
}
