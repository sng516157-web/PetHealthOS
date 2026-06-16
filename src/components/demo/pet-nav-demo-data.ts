import type { SerializedWeight } from "@/components/WeightPanel";
import type { SerializedAttachment } from "@/components/DocumentsPanel";
import type { SerializedReminder } from "@/components/RemindersPanel";

const now = Date.now();
const day = 86400000;

export const DEMO_WEIGHTS: SerializedWeight[] = [
  { id: "w1", weightKg: 10.2, measuredAt: new Date(now - 90 * day).toISOString(), note: "Vet visit baseline" },
  { id: "w2", weightKg: 10.45, measuredAt: new Date(now - 75 * day).toISOString(), note: null },
  { id: "w3", weightKg: 10.8, measuredAt: new Date(now - 60 * day).toISOString(), note: "After diet change" },
  { id: "w4", weightKg: 11.0, measuredAt: new Date(now - 45 * day).toISOString(), note: null },
  { id: "w5", weightKg: 11.15, measuredAt: new Date(now - 30 * day).toISOString(), note: "Healthy gain" },
  { id: "w6", weightKg: 11.2, measuredAt: new Date(now - 14 * day).toISOString(), note: null },
  { id: "w7", weightKg: 11.35, measuredAt: new Date(now - 7 * day).toISOString(), note: "Home scale" },
  { id: "w8", weightKg: 11.4, measuredAt: new Date(now - 2 * day).toISOString(), note: "Before breakfast" },
];

export const DEMO_REMINDERS: SerializedReminder[] = [
  {
    id: "r1",
    title: "Rabies booster",
    category: "VACCINE",
    dueAt: new Date(now + 5 * day).toISOString(),
    recurrence: null,
    completed: false,
    notes: "City clinic — bring passport",
  },
  {
    id: "r2",
    title: "Heartworm prevention",
    category: "MEDICATION",
    dueAt: new Date(now + 12 * day).toISOString(),
    recurrence: "MONTHLY",
    completed: false,
    notes: null,
  },
  {
    id: "r3",
    title: "Annual check-up",
    category: "CHECKUP",
    dueAt: new Date(now - 3 * day).toISOString(),
    recurrence: null,
    completed: false,
    notes: "Overdue — book this week",
  },
  {
    id: "r4",
    title: "Deworming",
    category: "DEWORMING",
    dueAt: new Date(now - 20 * day).toISOString(),
    recurrence: null,
    completed: true,
    notes: null,
  },
];

export const DEMO_ATTACHMENTS: SerializedAttachment[] = [
  {
    id: "d1",
    kind: "VACCINE_CERT",
    label: "Rabies 2025",
    url: "/brand/app-icon-32.png",
    mimeType: "image/png",
  },
  {
    id: "d2",
    kind: "VACCINE_CERT",
    label: "DHPP series",
    url: "/brand/app-icon-32.png",
    mimeType: "image/png",
  },
  {
    id: "d3",
    kind: "ANTIBODY_TEST",
    label: "CDV antibody titer",
    url: "/brand/app-icon-32.png",
    mimeType: "image/png",
  },
  {
    id: "d4",
    kind: "LAB_RESULT",
    label: "CBC — June 2025",
    url: "/brand/app-icon-32.png",
    mimeType: "application/pdf",
  },
  {
    id: "d5",
    kind: "PEDIGREE",
    label: "AKC registration",
    url: "/brand/app-icon-32.png",
    mimeType: "application/pdf",
  },
  {
    id: "d6",
    kind: "PHOTO",
    label: "Profile photo",
    url: "/brand/app-icon-32.png",
    mimeType: "image/png",
  },
  {
    id: "d7",
    kind: "OTHER",
    label: "Insurance card",
    url: "/brand/app-icon-32.png",
    mimeType: "application/pdf",
  },
];

export const DEMO_ACTIVE_STAYS = [{ id: "s1", orgName: "Happy Paws Boarding" }];
