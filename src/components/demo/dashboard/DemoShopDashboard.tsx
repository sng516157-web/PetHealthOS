"use client";

import { DemoDashboardChrome } from "./DemoDashboardChrome";
import { DemoWorkspaceShell } from "./DemoShells";
import { ShopHomeView } from "@/components/dashboard/ShopHomeView";
import {
  PREVIEW_SHOP_ATTENTION,
  PREVIEW_SHOP_ORG,
  PREVIEW_SHOP_PETS,
  PREVIEW_SHOP_REMINDERS,
} from "@/lib/dashboard-preview-data";

export function DemoShopDashboard() {
  return (
    <div className="min-h-screen bg-paper">
      <DemoDashboardChrome active="shop" />
      <DemoWorkspaceShell orgName={PREVIEW_SHOP_ORG}>
        <ShopHomeView
          orgName={PREVIEW_SHOP_ORG}
          pets={[...PREVIEW_SHOP_PETS]}
          attention={[...PREVIEW_SHOP_ATTENTION]}
          reminders={[...PREVIEW_SHOP_REMINDERS]}
        />
      </DemoWorkspaceShell>
    </div>
  );
}
