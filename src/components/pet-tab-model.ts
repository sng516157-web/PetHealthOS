import type { LucideIcon } from "lucide-react";
import {
  NotebookPen,
  Sparkles,
  Stethoscope,
  Send,
  Bell,
  Scale,
  FileText,
  Hospital,
  UtensilsCrossed,
  Footprints,
} from "lucide-react";

/** Shared tab ids for PetTabs + landing preview — keep in sync when adding pet tabs. */
export type PetMainTabId =
  | "logs"
  | "chat"
  | "triage"
  | "reminders"
  | "weight"
  | "documents"
  | "checkin"
  | "transfer";

export type PetLogSubTabId = "quick" | "food" | "activity";

export type PetTabDef = {
  id: PetMainTabId | PetLogSubTabId;
  label: string;
  icon: LucideIcon;
};

export type PetTabModelOptions = {
  includeTransfer?: boolean;
  includeCheckin?: boolean;
  includeAI?: boolean;
  includeTriage?: boolean;
};

type TabLabels = {
  logs: string;
  aiAssistant: string;
  triage: string;
  reminders: string;
  weight: string;
  documents: string;
  checkin: string;
  transfer: string;
  quickLog: string;
  foodLog: string;
  activityLog: string;
};

/** Single source of truth for pet major + log sub-tabs (labels/icons/order). */
export function buildPetTabModel(
  labels: TabLabels,
  {
    includeTransfer = false,
    includeCheckin = false,
    includeAI = true,
    includeTriage = true,
  }: PetTabModelOptions = {},
): { mainTabs: PetTabDef[]; logSubTabs: PetTabDef[] } {
  const mainTabs: PetTabDef[] = [
    { id: "logs", label: labels.logs, icon: NotebookPen },
    ...(includeAI
      ? [{ id: "chat" as const, label: labels.aiAssistant, icon: Sparkles }]
      : []),
    ...(includeTriage
      ? [{ id: "triage" as const, label: labels.triage, icon: Stethoscope }]
      : []),
    { id: "reminders", label: labels.reminders, icon: Bell },
    { id: "weight", label: labels.weight, icon: Scale },
    { id: "documents", label: labels.documents, icon: FileText },
    ...(includeCheckin
      ? [{ id: "checkin" as const, label: labels.checkin, icon: Hospital }]
      : []),
    ...(includeTransfer
      ? [{ id: "transfer" as const, label: labels.transfer, icon: Send }]
      : []),
  ];

  const logSubTabs: PetTabDef[] = [
    { id: "quick", label: labels.quickLog, icon: NotebookPen },
    { id: "food", label: labels.foodLog, icon: UtensilsCrossed },
    { id: "activity", label: labels.activityLog, icon: Footprints },
  ];

  return { mainTabs, logSubTabs };
}

export function petTabHref(
  base: string,
  mainTab: PetMainTabId,
  logSubTab: PetLogSubTabId = "quick",
): string {
  if (mainTab === "logs") {
    if (logSubTab === "food") return `${base}/food`;
    if (logSubTab === "activity") return `${base}/activity`;
    return base;
  }
  return `${base}/${mainTab}`;
}

export function matchPetPath(
  pathname: string,
  base: string,
  logPaths: string[],
): { mainTab: PetMainTabId; logSubTab: PetLogSubTabId } {
  if (pathname === `${base}/food` || pathname.startsWith(`${base}/food/`)) {
    return { mainTab: "logs", logSubTab: "food" };
  }
  if (pathname === `${base}/activity` || pathname.startsWith(`${base}/activity/`)) {
    return { mainTab: "logs", logSubTab: "activity" };
  }
  if (logPaths.includes(pathname) || pathname === base) {
    return { mainTab: "logs", logSubTab: "quick" };
  }
  for (const segment of [
    "chat",
    "triage",
    "reminders",
    "weight",
    "documents",
    "checkin",
    "transfer",
  ] as PetMainTabId[]) {
    if (pathname === `${base}/${segment}` || pathname.startsWith(`${base}/${segment}/`)) {
      return { mainTab: segment, logSubTab: "quick" };
    }
  }
  return { mainTab: "logs", logSubTab: "quick" };
}
