"use client";

import { DemoDashboardChrome } from "./DemoDashboardChrome";
import { DemoWorkspaceShell } from "./DemoShells";
import { FacilityHomeView } from "@/components/dashboard/FacilityHomeView";
import {
  PREVIEW_FACILITY_CAPACITY,
  PREVIEW_FACILITY_ORG,
  PREVIEW_FACILITY_PETS,
} from "@/lib/dashboard-preview-data";

export function DemoFacilityDashboard() {
  return (
    <div className="min-h-screen bg-paper">
      <DemoDashboardChrome active="facility" />
      <DemoWorkspaceShell orgName={PREVIEW_FACILITY_ORG}>
        <FacilityHomeView
          orgName={PREVIEW_FACILITY_ORG}
          inCare={PREVIEW_FACILITY_PETS.length}
          capacityLimit={PREVIEW_FACILITY_CAPACITY}
          pets={[...PREVIEW_FACILITY_PETS]}
        />
      </DemoWorkspaceShell>
    </div>
  );
}
