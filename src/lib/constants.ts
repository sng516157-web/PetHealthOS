// Enum-like constants. SQLite has no native enums, so these are the source of truth.

export const SPECIES = ["DOG", "CAT"] as const;
export type Species = (typeof SPECIES)[number];

export const SEX = ["MALE", "FEMALE", "UNKNOWN"] as const;
export type Sex = (typeof SEX)[number];

export const PET_STATUS = [
  "ACTIVE",
  "UNDER_OBSERVATION",
  "TRANSFERRED",
  "ARCHIVED",
] as const;
export type PetStatus = (typeof PET_STATUS)[number];

// Organization kinds. SHOP/BREEDER/SHELTER own pets and may issue passports;
// HOSPITAL/BOARDING are "facility" accounts (vet clinic / pet hotel) that get
// time-boxed access to owner-owned pets via check-in and cannot issue passports.
export const ORG_KINDS = ["BREEDER", "SHOP", "SHELTER", "HOSPITAL", "BOARDING"] as const;
export type OrgKind = (typeof ORG_KINDS)[number];

export const FACILITY_KINDS = ["HOSPITAL", "BOARDING"] as const;

export function isFacilityKind(kind: string | null | undefined): boolean {
  return kind === "HOSPITAL" || kind === "BOARDING";
}

export const LOG_TYPES = [
  "ILLNESS",
  "VET_VISIT",
  "OBSERVATION",
  "MEDICATION",
  "DISCOMFORT",
  "MILESTONE",
  "FEEDING",
  "OTHER",
] as const;
export type LogType = (typeof LOG_TYPES)[number];

export const SEVERITY = ["NONE", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Severity = (typeof SEVERITY)[number];

// Health-guarantee presets baked into a passport. CUSTOM lets the shop enter its
// own window (days); NONE means no warranty. Days drive the active/expired status.
export const GUARANTEE_TYPES = [
  "NONE",
  "D7",
  "D30",
  "CONGENITAL_1Y",
  "CUSTOM",
] as const;
export type GuaranteeType = (typeof GUARANTEE_TYPES)[number];

export const GUARANTEE_PRESET_DAYS: Record<GuaranteeType, number | null> = {
  NONE: null,
  D7: 7,
  D30: 30,
  CONGENITAL_1Y: 365,
  CUSTOM: null,
};

export const REMINDER_CATEGORIES = [
  "VACCINE",
  "MEDICATION",
  "DEWORMING",
  "APPOINTMENT",
  "CHECKUP",
  "OTHER",
] as const;
export type ReminderCategory = (typeof REMINDER_CATEGORIES)[number];

export const URGENCY = [
  "EMERGENCY",
  "URGENT",
  "SOON",
  "ROUTINE",
  "MONITOR",
] as const;
export type Urgency = (typeof URGENCY)[number];

// ---- Display helpers ----

export const LOG_TYPE_META: Record<
  LogType,
  { label: string; emoji: string; color: string }
> = {
  ILLNESS: { label: "Illness", emoji: "🤒", color: "rose" },
  VET_VISIT: { label: "Vet visit", emoji: "🏥", color: "sky" },
  OBSERVATION: { label: "Observation", emoji: "👀", color: "slate" },
  MEDICATION: { label: "Medication", emoji: "💊", color: "violet" },
  DISCOMFORT: { label: "Discomfort", emoji: "😣", color: "amber" },
  MILESTONE: { label: "Milestone", emoji: "🎉", color: "emerald" },
  FEEDING: { label: "Feeding", emoji: "🍽️", color: "teal" },
  OTHER: { label: "Other", emoji: "📝", color: "slate" },
};

export const SEVERITY_META: Record<
  Severity,
  { label: string; color: string; rank: number }
> = {
  NONE: { label: "None", color: "slate", rank: 0 },
  LOW: { label: "Low", color: "emerald", rank: 1 },
  MEDIUM: { label: "Medium", color: "amber", rank: 2 },
  HIGH: { label: "High", color: "orange", rank: 3 },
  CRITICAL: { label: "Critical", color: "rose", rank: 4 },
};

export const URGENCY_META: Record<
  Urgency,
  { label: string; color: string; blurb: string }
> = {
  EMERGENCY: {
    label: "Emergency",
    color: "rose",
    blurb: "Seek veterinary care immediately.",
  },
  URGENT: {
    label: "Urgent",
    color: "orange",
    blurb: "See a vet within 24 hours.",
  },
  SOON: {
    label: "See soon",
    color: "amber",
    blurb: "Book a veterinary appointment in the next few days.",
  },
  MONITOR: {
    label: "Monitor",
    color: "sky",
    blurb: "Keep observing and log any changes.",
  },
  ROUTINE: {
    label: "Routine",
    color: "emerald",
    blurb: "No urgent concerns based on the current log.",
  },
};

export const ATTACHMENT_KINDS = [
  "VACCINE_CERT",
  "ANTIBODY_TEST",
  "PEDIGREE",
  "LAB_RESULT",
  "PHOTO",
  "OTHER",
] as const;
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const ATTACHMENT_KIND_META: Record<
  AttachmentKind,
  { label: string; emoji: string }
> = {
  VACCINE_CERT: { label: "Vaccination certificate", emoji: "💉" },
  // Antibody titer results are the proof buyers/industry actually trust
  // (vaccine claims alone are easily faked). Optional — many shops won't have it.
  ANTIBODY_TEST: { label: "Antibody test (抗体检测)", emoji: "🧫" },
  PEDIGREE: { label: "Pedigree / registration", emoji: "📜" },
  LAB_RESULT: { label: "Lab / test result", emoji: "🧪" },
  PHOTO: { label: "Photo", emoji: "🖼️" },
  OTHER: { label: "Document", emoji: "📄" },
};

export const TRANSFER_VISIBILITY = ["READONLY_COPY", "SHARED"] as const;
export type TransferVisibility = (typeof TRANSFER_VISIBILITY)[number];

export const REMINDER_CATEGORY_META: Record<
  ReminderCategory,
  { label: string; emoji: string }
> = {
  VACCINE: { label: "Vaccine", emoji: "💉" },
  MEDICATION: { label: "Medication", emoji: "💊" },
  DEWORMING: { label: "Deworming", emoji: "🪱" },
  APPOINTMENT: { label: "Appointment", emoji: "📅" },
  CHECKUP: { label: "Check-up", emoji: "🩺" },
  OTHER: { label: "Other", emoji: "🔔" },
};
