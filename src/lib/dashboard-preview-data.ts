import { FACILITY_BASE_CAPACITY } from "@/lib/plans";
import type { OrgWardTriageResult } from "@/lib/ai";

const now = Date.now();
const day = 86400000;

/** Preview user name shown on landing mini dashboards. */
export const PREVIEW_USER_NAME = "Jordan";

/** Preview org names — update when marketing copy changes. */
export const PREVIEW_SHOP_ORG = "Sunrise Cattery";
export const PREVIEW_FACILITY_ORG = "Happy Paws Animal Hospital";

/** Owner `/me` home — shape matches `OwnerHomeView` props. */
export const PREVIEW_OWNER_PETS = [
  {
    id: "preview-o1",
    name: "Mochi",
    species: "CAT",
    breed: "British Shorthair",
    birthDate: new Date(now - 730 * day).toISOString(),
    status: "ACTIVE",
    photoUrl: null,
  },
  {
    id: "preview-o2",
    name: "Buddy",
    species: "DOG",
    breed: "Golden Retriever",
    birthDate: new Date(now - 1460 * day).toISOString(),
    status: "ACTIVE",
    photoUrl: null,
  },
  {
    id: "preview-o3",
    name: "Luna",
    species: "CAT",
    breed: "Ragdoll",
    birthDate: new Date(now - 365 * day).toISOString(),
    status: "UNDER_OBSERVATION",
    photoUrl: null,
  },
] as const;

export const PREVIEW_OWNER_NOTIFICATIONS = [
  {
    id: "preview-n1",
    title: "Vaccine due in 5 days",
    body: "Rabies booster scheduled",
    kind: "REMINDER",
    readAt: null,
    createdAt: new Date(now - 2 * 3600000).toISOString(),
    dueAt: new Date(now + 5 * day).toISOString(),
    pet: { id: "preview-o1", name: "Mochi", species: "CAT" },
  },
  {
    id: "preview-n2",
    title: "Weight log reminder",
    body: null,
    kind: "REMINDER",
    readAt: new Date(now - day).toISOString(),
    createdAt: new Date(now - 3 * day).toISOString(),
    dueAt: new Date(now + 2 * day).toISOString(),
    pet: { id: "preview-o2", name: "Buddy", species: "DOG" },
  },
  {
    id: "preview-n3",
    title: "Follow-up check suggested",
    body: "Based on recent logs",
    kind: "HEALTH",
    readAt: null,
    createdAt: new Date(now - 6 * 3600000).toISOString(),
    dueAt: null,
    pet: { id: "preview-o3", name: "Luna", species: "CAT" },
  },
];

const shopPetBase = (id: string, name: string, species: string, breed: string, status: string, severity: string, note: string, logCount: number) => ({
  id,
  name,
  species,
  breed,
  birthDate: new Date(now - 400 * day).toISOString(),
  status,
  photoUrl: null,
  logCount,
  last: {
    title: note,
    rawText: note,
    severity,
    type: "ILLNESS",
  },
});

/** Shop `/app` home — shape matches `ShopHomeView` props. */
export const PREVIEW_SHOP_PETS = [
  shopPetBase("preview-s1", "Coco", "CAT", "Maine Coon", "ACTIVE", "MEDIUM", "Mild cough — owner notified", 12),
  shopPetBase("preview-s2", "Pearl", "CAT", "Siamese", "ACTIVE", "MEDIUM", "Vaccine overdue", 8),
  shopPetBase("preview-s3", "Rocky", "DOG", "Labrador", "UNDER_OBSERVATION", "LOW", "Under observation after intake", 15),
  shopPetBase("preview-s4", "Dash", "DOG", "Corgi", "ACTIVE", "NONE", "Routine wellness check", 6),
  shopPetBase("preview-s5", "Milo", "CAT", "Persian", "ACTIVE", "NONE", "Ate well this morning", 9),
  shopPetBase("preview-s6", "Nala", "DOG", "Beagle", "ACTIVE", "NONE", "Walk completed", 11),
];

export const PREVIEW_SHOP_ATTENTION = PREVIEW_SHOP_PETS.filter(
  (p) => p.status === "UNDER_OBSERVATION" || (p.last && p.last.severity !== "NONE"),
).slice(0, 3);

export const PREVIEW_SHOP_REMINDERS = [
  {
    id: "preview-r1",
    petId: "preview-s2",
    title: "FVRCP booster",
    category: "VACCINE",
    dueAt: new Date(now + day).toISOString(),
    pet: { name: "Pearl" },
  },
  {
    id: "preview-r2",
    petId: "preview-s3",
    title: "Deworming",
    category: "DEWORMING",
    dueAt: new Date(now + 3 * day).toISOString(),
    pet: { name: "Rocky" },
  },
  {
    id: "preview-r3",
    petId: "preview-s1",
    title: "Weight check",
    category: "CHECKUP",
    dueAt: new Date(now - day).toISOString(),
    pet: { name: "Coco" },
  },
];

/** Facility `/app` home — shape matches `FacilityHomeView` props. */
export const PREVIEW_FACILITY_PETS = [
  {
    id: "preview-f1",
    name: "Biscuit",
    species: "DOG",
    breed: "Shiba Inu",
    photoUrl: null,
    birthDate: new Date(now - 800 * day).toISOString(),
    logCount: 4,
    last: {
      title: "Post-op check",
      rawText: "Post-op check — stable, eating small meals",
      severity: "LOW",
      occurredAt: new Date(now - 4 * 3600000).toISOString(),
    },
  },
  {
    id: "preview-f2",
    name: "Willow",
    species: "CAT",
    breed: "Domestic Shorthair",
    photoUrl: null,
    birthDate: new Date(now - 600 * day).toISOString(),
    logCount: 2,
    last: {
      title: "Boarding day 2",
      rawText: "Boarding day 2 — eating well, playful",
      severity: "NONE",
      occurredAt: new Date(now - 8 * 3600000).toISOString(),
    },
  },
  {
    id: "preview-f3",
    name: "Otis",
    species: "DOG",
    breed: "French Bulldog",
    photoUrl: null,
    birthDate: new Date(now - 500 * day).toISOString(),
    logCount: 7,
    last: {
      title: "IV fluids",
      rawText: "IV fluids overnight — monitor resp rate",
      severity: "MEDIUM",
      occurredAt: new Date(now - 2 * 3600000).toISOString(),
    },
  },
];

export const PREVIEW_FACILITY_CAPACITY = FACILITY_BASE_CAPACITY;

/** Canned ward triage for landing preview org AI tab. */
export const PREVIEW_ORG_WARD_TRIAGE: OrgWardTriageResult = {
  summary:
    "3 pets in care; 2 need extra attention. Otis has medium-severity respiratory monitoring; Biscuit is post-op day 1.",
  watchList: [
    {
      petName: "Otis",
      reason: "IV fluids overnight — monitor resp rate",
      urgency: "SOON",
    },
    {
      petName: "Biscuit",
      reason: "Post-op check — stable but on small meals",
      urgency: "MONITOR",
    },
  ],
  teamNotes: [
    "Recheck Otis resp rate and appetite on morning rounds",
    "Confirm Biscuit incision site before discharge planning",
  ],
};

export type PreviewPetRecord = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthDate: string | null;
  photoUrl: string | null;
};

export function findPreviewPet(id: string): PreviewPetRecord | undefined {
  for (const p of [...PREVIEW_OWNER_PETS, ...PREVIEW_SHOP_PETS, ...PREVIEW_FACILITY_PETS]) {
    if (p.id === id) {
      return {
        id: p.id,
        name: p.name,
        species: p.species,
        breed: p.breed,
        birthDate: p.birthDate,
        photoUrl: p.photoUrl,
      };
    }
  }
  return undefined;
}

export function previewWorkspacePath(
  role: "owner" | "shop" | "facility",
  opts?: { petId?: string | null; orgAi?: boolean },
): string {
  if (opts?.orgAi && role !== "owner") return "pethealthos.online/app/ai";
  return previewPetPath(role, opts?.petId);
}

export function previewPetPath(
  role: "owner" | "shop" | "facility",
  petId?: string | null,
): string {
  if (!petId) return role === "owner" ? "pethealthos.online/me" : "pethealthos.online/app";
  const pet = findPreviewPet(petId);
  const slug = pet?.name.toLowerCase() ?? "pet";
  return role === "owner"
    ? `pethealthos.online/me/pets/${slug}`
    : `pethealthos.online/app/pets/${slug}`;
}
