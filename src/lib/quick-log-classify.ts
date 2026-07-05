import {
  ACTIVITY_INTENSITIES,
  ACTIVITY_TYPES,
  APPETITE_LEVELS,
  LOG_TYPES,
  MEAL_TYPES,
  MEDICATION_ROUTES,
  SEVERITY,
  type ActivityIntensity,
  type ActivityType,
  type AppetiteLevel,
  type LogBucket,
  type MealType,
  type MedicationRoute,
} from "@/lib/constants";
import type { StructuredLogResult } from "@/lib/ai";

export type QuickLogRoute = LogBucket;

export type QuickLogFoodFields = {
  mealType: MealType;
  foodName: string;
  amount: string | null;
  appetite: AppetiteLevel;
  notes: string | null;
};

export type QuickLogActivityFields = {
  activityType: ActivityType;
  durationMin: number | null;
  distanceKm: number | null;
  intensity: ActivityIntensity;
  notes: string | null;
};

export type QuickLogMedicationFields = {
  medicationName: string;
  dose: string | null;
  route: MedicationRoute;
  notes: string | null;
};

export type QuickLogClassification =
  | { route: "health"; health: StructuredLogResult }
  | { route: "food"; food: QuickLogFoodFields }
  | { route: "activity"; activity: QuickLogActivityFields }
  | { route: "medication"; medication: QuickLogMedicationFields };

function has(text: string, ...words: string[]) {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w));
}

export function heuristicQuickLogRoute(text: string): QuickLogRoute {
  if (has(text, "walk", "walked", "walking", " run", "ran ", "jog", "hike", "fetch", "park visit", "played", "play time", "training session", "exercise")) {
    return "activity";
  }
  if (has(text, "medication", "medicine", " pill", "tablet", "capsule", "antibiotic", "antibiotic", "drops", "injection", " syringe", "dose of", "mg ", "ml ", "gave her", "gave him", "administered")) {
    return "medication";
  }
  if (has(text, "ate", " eat", "eating", "food", "meal", "breakfast", "lunch", "dinner", "snack", "treat", "kibble", "fed ", "feeding", "appetite", "bowl", "hungry", "refused food", "won't eat", "not eating")) {
    return "food";
  }
  return "health";
}

function inferMealType(text: string): MealType {
  const t = text.toLowerCase();
  if (/\bbreakfast\b|早餐|早饭/.test(t)) return "BREAKFAST";
  if (/\blunch\b|午餐|午饭/.test(t)) return "LUNCH";
  if (/\bdinner\b|supper\b|晚餐|晚饭/.test(t)) return "DINNER";
  if (/\bsnack\b|零食/.test(t)) return "SNACK";
  if (/\btreat\b|小零食/.test(t)) return "TREAT";
  return "OTHER";
}

function inferAppetite(text: string): AppetiteLevel {
  const t = text.toLowerCase();
  if (/refused|won't eat|not eating|no appetite|拒食|不吃/.test(t)) return "REFUSED";
  if (/ate less|decreased|picky|吃得少/.test(t)) return "DECREASED";
  if (/ate more|increased|extra hungry|吃很多/.test(t)) return "INCREASED";
  return "NORMAL";
}

function inferActivityType(text: string): ActivityType {
  const t = text.toLowerCase();
  if (/\brun|\bjog/.test(t)) return "RUN";
  if (/\bplay|\bfetch/.test(t)) return "PLAY";
  if (/\btrain/.test(t)) return "TRAINING";
  if (/\bpark\b/.test(t)) return "PARK";
  if (/\bwalk/.test(t)) return "WALK";
  return "OTHER";
}

function inferDurationMin(text: string): number | null {
  const en = text.match(/(\d+)\s*(?:min(?:ute)?s?|mins?)\b/i);
  if (en) return parseInt(en[1], 10);
  const zh = text.match(/(\d+)\s*分钟/);
  if (zh) return parseInt(zh[1], 10);
  if (/half an hour|half hour|半小时/.test(text)) return 30;
  return null;
}

function inferIntensity(text: string): ActivityIntensity {
  const t = text.toLowerCase();
  if (/vigorous|intense|hard|fast|剧烈/.test(t)) return "VIGOROUS";
  if (/light|easy|gentle|slow|轻松/.test(t)) return "LIGHT";
  return "MODERATE";
}

function inferMedRoute(text: string): MedicationRoute {
  const t = text.toLowerCase();
  if (/injection|inject|shot|syringe|注射/.test(t)) return "INJECTION";
  if (/topical|cream|ointment|skin|外用/.test(t)) return "TOPICAL";
  return "ORAL";
}

function inferDose(text: string): string | null {
  const m = text.match(/\b(\d+(?:\.\d+)?\s*(?:mg|ml|g|tablet|pill|drop|drops|cap|capsule)s?)\b/i);
  return m ? m[1] : null;
}

function titleFrom(text: string, max = 6): string {
  const words = text.trim().split(/\s+/);
  return words.slice(0, max).join(" ") + (words.length > max ? "…" : "");
}

export function heuristicClassifyQuickLog(text: string): QuickLogClassification {
  const route = heuristicQuickLogRoute(text);

  if (route === "food") {
    const doseMatch = text.match(/(?:^|\s)(\d+(?:\.\d+)?\s*(?:cup|cups|oz|g|kg|pouch|pouches|碗|杯|克|袋))\b/i);
    return {
      route: "food",
      food: {
        mealType: inferMealType(text),
        foodName: titleFrom(text, 8) || text.slice(0, 80),
        amount: doseMatch?.[1]?.trim() ?? null,
        appetite: inferAppetite(text),
        notes: text.length > 80 ? text : null,
      },
    };
  }

  if (route === "activity") {
    return {
      route: "activity",
      activity: {
        activityType: inferActivityType(text),
        durationMin: inferDurationMin(text),
        distanceKm: null,
        intensity: inferIntensity(text),
        notes: text,
      },
    };
  }

  if (route === "medication") {
    const dose = inferDose(text);
    return {
      route: "medication",
      medication: {
        medicationName: titleFrom(text, 8) || text.slice(0, 80),
        dose,
        route: inferMedRoute(text),
        notes: text,
      },
    };
  }

  // health — reuse inline heuristic (mirrors ai.heuristicStructure without import cycle)
  const t = text.toLowerCase();
  let type: StructuredLogResult["type"] = "OBSERVATION";
  if (has(text, "vet", "clinic", "veterinarian", "checkup", "examined")) type = "VET_VISIT";
  else if (has(text, "vomit", "diarrhea", "fever", "sick", "infection", "cough", "sneez", "limp")) type = "ILLNESS";
  else if (has(text, "medication", "med", "pill", "dose", "antibiotic", "tablet", "drops")) type = "MEDICATION";
  else if (has(text, "pain", "uncomfortable", "discomfort", "itch", "scratch", "whining", "crying")) type = "DISCOMFORT";
  else if (has(text, "ate", "food", "feeding", "appetite", "meal", "kibble")) type = "FEEDING";
  else if (has(text, "first", "milestone", "weight gain", "grew", "birthday")) type = "MILESTONE";

  let severity: StructuredLogResult["severity"] = "NONE";
  if (has(text, "collapse", "seizure", "blood", "can't breathe", "cannot breathe", "unconscious", "emergency")) severity = "CRITICAL";
  else if (has(text, "not eating", "won't eat", "lethargic", "repeated", "severe", "high fever")) severity = "HIGH";
  else if (has(text, "vomit", "diarrhea", "limp", "fever", "infection")) severity = "MEDIUM";
  else if (has(text, "pain", "itch", "uncomfortable", "mild", "slightly")) severity = "LOW";

  const tags = Array.from(
    new Set(
      ["vomit", "diarrhea", "fever", "cough", "appetite", "lethargic", "itch", "limp", "vaccine", "medication", "weight"].filter(
        (w) => t.includes(w),
      ),
    ),
  );

  return {
    route: "health",
    health: {
      type,
      severity,
      title: titleFrom(text) || "Log entry",
      summary: text.length > 140 ? text.slice(0, 137) + "…" : text,
      tags,
    },
  };
}

/** Validate AI quick-log object against our enums; fall back field-by-field. */
export function sanitizeQuickLogClassification(raw: {
  route: string;
  mealType?: string;
  foodName?: string;
  amount?: string | null;
  appetite?: string;
  foodNotes?: string | null;
  activityType?: string;
  durationMin?: number | null;
  distanceKm?: number | null;
  intensity?: string;
  activityNotes?: string | null;
  medicationName?: string;
  dose?: string | null;
  medRoute?: string;
  medNotes?: string | null;
  type?: string;
  severity?: string;
  title?: string;
  summary?: string;
  tags?: string[];
}): QuickLogClassification {
  const route = (["health", "food", "activity", "medication"] as const).includes(
    raw.route as QuickLogRoute,
  )
    ? (raw.route as QuickLogRoute)
    : heuristicQuickLogRoute(raw.foodName ?? raw.activityNotes ?? raw.medNotes ?? raw.title ?? "");

  if (route === "food") {
    return {
      route: "food",
      food: {
        mealType: MEAL_TYPES.includes(raw.mealType as MealType) ? (raw.mealType as MealType) : inferMealType(raw.foodName ?? ""),
        foodName: (raw.foodName ?? raw.title ?? "Meal").slice(0, 200),
        amount: raw.amount ?? null,
        appetite: APPETITE_LEVELS.includes(raw.appetite as AppetiteLevel)
          ? (raw.appetite as AppetiteLevel)
          : inferAppetite(raw.foodNotes ?? raw.foodName ?? ""),
        notes: raw.foodNotes ?? null,
      },
    };
  }

  if (route === "activity") {
    return {
      route: "activity",
      activity: {
        activityType: ACTIVITY_TYPES.includes(raw.activityType as ActivityType)
          ? (raw.activityType as ActivityType)
          : inferActivityType(raw.activityNotes ?? ""),
        durationMin: raw.durationMin ?? inferDurationMin(raw.activityNotes ?? ""),
        distanceKm: raw.distanceKm ?? null,
        intensity: ACTIVITY_INTENSITIES.includes(raw.intensity as ActivityIntensity)
          ? (raw.intensity as ActivityIntensity)
          : inferIntensity(raw.activityNotes ?? ""),
        notes: raw.activityNotes ?? null,
      },
    };
  }

  if (route === "medication") {
    return {
      route: "medication",
      medication: {
        medicationName: (raw.medicationName ?? raw.title ?? "Medication").slice(0, 200),
        dose: raw.dose ?? null,
        route: MEDICATION_ROUTES.includes(raw.medRoute as MedicationRoute)
          ? (raw.medRoute as MedicationRoute)
          : inferMedRoute(raw.medNotes ?? ""),
        notes: raw.medNotes ?? null,
      },
    };
  }

  return {
    route: "health",
    health: {
      type: LOG_TYPES.includes(raw.type as StructuredLogResult["type"])
        ? (raw.type as StructuredLogResult["type"])
        : "OBSERVATION",
      severity: SEVERITY.includes(raw.severity as StructuredLogResult["severity"])
        ? (raw.severity as StructuredLogResult["severity"])
        : "NONE",
      title: raw.title ?? "Log entry",
      summary: raw.summary ?? raw.title ?? "",
      tags: raw.tags ?? [],
    },
  };
}
