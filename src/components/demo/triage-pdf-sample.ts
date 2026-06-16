import type { TriageResult } from "@/lib/ai";

export const DEMO_PET = {
  name: "Mango",
  species: "DOG" as const,
  breed: "Beagle",
  sex: "FEMALE" as const,
  birthDate: "2021-03-14",
  weightKg: 11.4,
  ownerName: "Alex Chen",
  ownerPhone: "+852 9123 4567",
};

export const DEMO_TRIAGE: TriageResult = {
  urgency: "SOON",
  summary:
    "Mango has had intermittent vomiting over the past 48 hours with reduced appetite and shorter walks. She is still drinking water and responsive, but energy is lower than baseline.",
  recommendation:
    "Book a vet appointment within the next 2–3 days. Bring this report and note exact vomit timing, food changes, and walk duration.",
  concerns: [
    {
      issue: "Repeated vomiting",
      detail: "Three episodes since yesterday morning, mostly after meals.",
      severity: "MEDIUM",
    },
    {
      issue: "Reduced appetite",
      detail: "Skipped breakfast today; ate only half of dinner last night.",
      severity: "MEDIUM",
    },
    {
      issue: "Lower activity",
      detail: "Walks shortened from ~35 min to ~15 min; lay down during play.",
      severity: "LOW",
    },
  ],
  vetQuestions: [
    "Could this be dietary indiscretion or something requiring imaging?",
    "Should we fast Mango or offer a bland diet until the visit?",
    "Any red flags that mean we should come in today instead?",
  ],
  positiveSigns: [
    "Still drinking water normally",
    "No blood in vomit noted",
    "Responsive and seeking affection",
  ],
  crossLogInsights: [
    "Vomiting episodes correlate with meals logged in the food diary.",
    "Appetite marked decreased/refused on two recent meals while walk duration dropped ~60%.",
    "Pattern suggests GI upset rather than sudden trauma — still needs professional assessment.",
  ],
};

export const DEMO_HEALTH_SNIPPET = [
  { at: "2026-06-16T08:30:00", text: "Vomited yellow bile after breakfast, seemed tired." },
  { at: "2026-06-15T19:00:00", text: "Ate half dinner, no vomiting overnight." },
  { at: "2026-06-15T07:45:00", text: "Normal breakfast, energetic on morning walk." },
];

export const DEMO_FOOD_SNIPPET = [
  { at: "2026-06-16T08:00:00", meal: "Breakfast", food: "Royal Canin GI", appetite: "REFUSED" },
  { at: "2026-06-15T18:30:00", meal: "Dinner", food: "Chicken & rice", appetite: "DECREASED" },
];

export const DEMO_ACTIVITY_SNIPPET = [
  { at: "2026-06-16T07:00:00", type: "Walk", duration: 15, intensity: "LIGHT" },
  { at: "2026-06-15T07:30:00", type: "Walk", duration: 35, intensity: "MODERATE" },
];
