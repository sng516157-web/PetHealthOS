export const DEMO_PET_HEADER = {
  name: "Mango",
  breed: "Beagle",
  ageLabel: "5 yrs",
};

export type DemoHealthEntry = {
  id: string;
  occurredAt: string;
  rawText: string;
  type: string;
  severity: string;
  title: string | null;
  summary: string | null;
  tags: string[];
  lockedAt?: string | null;
};

export type DemoFoodEntry = {
  id: string;
  occurredAt: string;
  mealType: string;
  foodName: string;
  portion: string;
  appetite: string;
  notes: string;
};

export type DemoActivityEntry = {
  id: string;
  occurredAt: string;
  activityType: string;
  durationMin: number;
  intensity: string;
  distanceKm: string;
  notes: string;
};

export const INITIAL_HEALTH: DemoHealthEntry[] = [
  {
    id: "h1",
    occurredAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    rawText: "Vomited once after breakfast, still drinking water.",
    type: "ILLNESS",
    severity: "MEDIUM",
    title: "Morning vomiting",
    summary: null,
    tags: ["vomit", "gi"],
  },
  {
    id: "h2",
    occurredAt: new Date(Date.now() - 86400000).toISOString(),
    rawText: "Monthly flea & tick treatment given.",
    type: "MEDICATION",
    severity: "NONE",
    title: null,
    summary: null,
    tags: ["prevention"],
    lockedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const INITIAL_FOOD: DemoFoodEntry[] = [
  {
    id: "f1",
    occurredAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    mealType: "BREAKFAST",
    foodName: "Royal Canin GI",
    portion: "1 cup",
    appetite: "REFUSED",
    notes: "Sniffed but did not eat",
  },
  {
    id: "f2",
    occurredAt: new Date(Date.now() - 20 * 3600000).toISOString(),
    mealType: "DINNER",
    foodName: "Chicken & rice",
    portion: "Half portion",
    appetite: "DECREASED",
    notes: "",
  },
];

export const INITIAL_ACTIVITY: DemoActivityEntry[] = [
  {
    id: "a1",
    occurredAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    activityType: "WALK",
    durationMin: 15,
    intensity: "LIGHT",
    distanceKm: "0.8",
    notes: "Stopped often, wanted to go home",
  },
  {
    id: "a2",
    occurredAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    activityType: "WALK",
    durationMin: 35,
    intensity: "MODERATE",
    distanceKm: "2.1",
    notes: "Normal energy",
  },
];
