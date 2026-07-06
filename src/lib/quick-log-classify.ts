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

/** One structured log produced from a quick-note clause. */
export type ParsedQuickLogEntry = {
  route: LogBucket;
  timeHint: string | null;
  clause: string;
  health?: StructuredLogResult;
  food?: QuickLogFoodFields;
  activity?: QuickLogActivityFields;
  medication?: QuickLogMedicationFields;
};

function has(text: string, ...words: string[]) {
  const t = text.toLowerCase();
  return words.some((w) => t.includes(w));
}

/** Split a compound note into clauses (comma / then / semicolon). */
export function splitQuickLogClauses(text: string): string[] {
  const parts = text
    .split(/\s*,\s*|\s*;\s*|\s+and then\s+|\s+then\s+/i)
    .map((s) => s.replace(/^(?:and|then)\s+/i, "").trim())
    .filter(Boolean);
  return parts.length ? parts : [text.trim()];
}

/** Pull a time phrase from a clause for per-event occurredAt. */
export function extractTimeHint(clause: string): string | null {
  const t = clause.trim();
  if (!t) return null;
  const patterns = [
    /\bat\s+\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)\b/i,
    /\b\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?)?\b/i,
    /\b\d{1,2}\s*(?:a\.?m\.?|p\.?m\.?)\b/i,
    /\b(?:this morning|this afternoon|this evening|tonight|today|yesterday)\b/i,
    /\d{1,2}\s*点(?:\s*半|\s*\d{1,2}\s*分)?/,
    /今天|昨天|今早|今晚|下午|早上/,
  ];
  for (const re of patterns) {
    const m = t.match(re);
    if (m) {
      const day =
        /\btoday\b|今天/.test(t) && !/yesterday|昨天/.test(m[0])
          ? "today "
          : /\byesterday\b|昨天/.test(t)
            ? "yesterday "
            : "";
      return (day + m[0]).trim();
    }
  }
  if (/\btoday\b|今天/.test(t)) return "today";
  if (/\byesterday\b|昨天/.test(t)) return "yesterday";
  return null;
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

function inferHealthType(text: string): StructuredLogResult["type"] {
  if (has(text, "vet", "clinic", "veterinarian", "checkup", "examined")) return "VET_VISIT";
  if (has(text, "vomit", "diarrhea", "fever", "sick", "infection", "cough", "sneez", "limp", "limping")) return "ILLNESS";
  if (has(text, "pain", "uncomfortable", "discomfort", "itch", "scratch", "whining", "crying")) return "DISCOMFORT";
  if (has(text, "first", "milestone", "weight gain", "grew", "birthday")) return "MILESTONE";
  return "OBSERVATION";
}

function inferSeverity(text: string): StructuredLogResult["severity"] {
  if (has(text, "collapse", "seizure", "blood", "can't breathe", "cannot breathe", "unconscious", "emergency")) return "CRITICAL";
  if (has(text, "not eating", "won't eat", "lethargic", "repeated", "severe", "high fever")) return "HIGH";
  if (has(text, "vomit", "diarrhea", "limp", "limping", "fever", "infection")) return "MEDIUM";
  if (has(text, "pain", "itch", "uncomfortable", "mild", "slightly")) return "LOW";
  return "NONE";
}

function healthTags(text: string): string[] {
  const t = text.toLowerCase();
  return Array.from(
    new Set(
      ["vomit", "diarrhea", "fever", "cough", "appetite", "lethargic", "itch", "limp", "limping", "vaccine", "medication", "weight"].filter(
        (w) => t.includes(w),
      ),
    ),
  );
}

function healthTitle(text: string): string {
  const t = text.toLowerCase();
  if (/limp|limping/.test(t)) return "Limping observed";
  if (/vomit/.test(t)) return "Vomiting";
  if (/cough/.test(t)) return "Coughing";
  if (/fever/.test(t)) return "Fever";
  if (/lethargic|tired|seems tired/.test(t)) return "Lethargy / tiredness";
  const words = text.trim().split(/\s+/);
  return words.slice(0, 6).join(" ") + (words.length > 6 ? "…" : "") || "Health observation";
}

function foodTitle(text: string): string {
  const meal = inferMealType(text);
  if (meal !== "OTHER") return meal.charAt(0) + meal.slice(1).toLowerCase().replace("_", " ");
  if (/ate|eating|fed/.test(text.toLowerCase())) return "Meal";
  return "Food intake";
}

function activityTitle(text: string): string {
  const type = inferActivityType(text);
  return type === "WALK" ? "Walk" : type.charAt(0) + type.slice(1).toLowerCase();
}

function medicationTitle(text: string): string {
  const dose = inferDose(text);
  if (/antibiotic/i.test(text)) return dose ? `Antibiotic (${dose})` : "Antibiotic dose";
  if (/medication|medicine|pill|tablet/i.test(text)) return dose ? `Medication (${dose})` : "Medication dose";
  return "Medication dose";
}

function oneLineSummary(text: string, max = 120): string {
  const s = text.trim().replace(/\s+/g, " ");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

export function heuristicQuickLogRoute(text: string): LogBucket {
  if (has(text, "walk", "walked", "walking", " run", "ran ", "jog", "hike", "fetch", "park visit", "played", "play time", "training session", "exercise", "took a walk")) {
    return "activity";
  }
  if (has(text, "medication", "medicine", " pill", "tablet", "capsule", "antibiotic", "drops", "injection", " syringe", "dose of", "mg ", "ml ", "took his", "took her", "gave her", "gave him", "administered")) {
    return "medication";
  }
  if (has(text, "ate", " eat", "eating", "food", "meal", "breakfast", "lunch", "dinner", "snack", "treat", "kibble", "fed ", "feeding", "appetite", "bowl", "hungry", "refused food", "won't eat", "not eating")) {
    return "food";
  }
  if (has(text, "vomit", "diarrhea", "fever", "sick", "limp", "limping", "cough", "pain", "lethargic", "itch", "uncomfortable")) {
    return "health";
  }
  return "health";
}

function classifyClause(clause: string): Omit<ParsedQuickLogEntry, "timeHint" | "clause"> {
  const route = heuristicQuickLogRoute(clause);

  if (route === "food") {
    const doseMatch = clause.match(/(?:^|\s)(\d+(?:\.\d+)?\s*(?:cup|cups|oz|g|kg|pouch|pouches|碗|杯|克|袋))\b/i);
    const title = foodTitle(clause);
    return {
      route: "food",
      food: {
        mealType: inferMealType(clause),
        foodName: title,
        amount: doseMatch?.[1]?.trim() ?? null,
        appetite: inferAppetite(clause),
        notes: oneLineSummary(clause),
      },
    };
  }

  if (route === "activity") {
    const title = activityTitle(clause);
    return {
      route: "activity",
      activity: {
        activityType: inferActivityType(clause),
        durationMin: inferDurationMin(clause),
        distanceKm: null,
        intensity: inferIntensity(clause),
        notes: oneLineSummary(clause) || title,
      },
    };
  }

  if (route === "medication") {
    const title = medicationTitle(clause);
    return {
      route: "medication",
      medication: {
        medicationName: title,
        dose: inferDose(clause),
        route: inferMedRoute(clause),
        notes: oneLineSummary(clause),
      },
    };
  }

  const type = inferHealthType(clause);
  const severity = inferSeverity(clause);
  const title = healthTitle(clause);
  return {
    route: "health",
    health: {
      type,
      severity,
      title,
      summary: oneLineSummary(clause),
      tags: healthTags(clause),
    },
  };
}

/** Heuristic multi-entry parse — one note can yield several logs. */
export function heuristicParseQuickLogNote(text: string): ParsedQuickLogEntry[] {
  return splitQuickLogClauses(text).map((clause) => ({
    clause,
    timeHint: extractTimeHint(clause),
    ...classifyClause(clause),
  }));
}

type RawQuickEntry = {
  route: string;
  timeHint?: string | null;
  clause?: string | null;
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
};

/** Normalize one AI-parsed entry; falls back to heuristic on the clause. */
export function sanitizeQuickLogEntry(raw: RawQuickEntry, fallbackClause = ""): ParsedQuickLogEntry {
  const clause = (raw.clause ?? fallbackClause).trim() || fallbackClause;
  const base = classifyClause(clause);
  const route = (["health", "food", "activity", "medication"] as const).includes(raw.route as LogBucket)
    ? (raw.route as LogBucket)
    : base.route;

  if (route === "food") {
    return {
      route: "food",
      clause,
      timeHint: raw.timeHint ?? extractTimeHint(clause),
      food: {
        mealType: MEAL_TYPES.includes(raw.mealType as MealType) ? (raw.mealType as MealType) : inferMealType(clause),
        foodName: (raw.foodName ?? raw.title ?? base.food?.foodName ?? "Meal").slice(0, 200),
        amount: raw.amount ?? base.food?.amount ?? null,
        appetite: APPETITE_LEVELS.includes(raw.appetite as AppetiteLevel)
          ? (raw.appetite as AppetiteLevel)
          : inferAppetite(clause),
        notes: (raw.foodNotes ?? raw.summary ?? base.food?.notes ?? oneLineSummary(clause)).slice(0, 500),
      },
    };
  }

  if (route === "activity") {
    return {
      route: "activity",
      clause,
      timeHint: raw.timeHint ?? extractTimeHint(clause),
      activity: {
        activityType: ACTIVITY_TYPES.includes(raw.activityType as ActivityType)
          ? (raw.activityType as ActivityType)
          : inferActivityType(clause),
        durationMin: raw.durationMin ?? inferDurationMin(clause),
        distanceKm: raw.distanceKm ?? null,
        intensity: ACTIVITY_INTENSITIES.includes(raw.intensity as ActivityIntensity)
          ? (raw.intensity as ActivityIntensity)
          : inferIntensity(clause),
        notes: (raw.activityNotes ?? raw.summary ?? base.activity?.notes ?? oneLineSummary(clause)).slice(0, 500),
      },
    };
  }

  if (route === "medication") {
    return {
      route: "medication",
      clause,
      timeHint: raw.timeHint ?? extractTimeHint(clause),
      medication: {
        medicationName: (raw.medicationName ?? raw.title ?? base.medication?.medicationName ?? "Medication").slice(0, 200),
        dose: raw.dose ?? inferDose(clause),
        route: MEDICATION_ROUTES.includes(raw.medRoute as MedicationRoute)
          ? (raw.medRoute as MedicationRoute)
          : inferMedRoute(clause),
        notes: (raw.medNotes ?? raw.summary ?? base.medication?.notes ?? oneLineSummary(clause)).slice(0, 500),
      },
    };
  }

  return {
    route: "health",
    clause,
    timeHint: raw.timeHint ?? extractTimeHint(clause),
    health: {
      type: LOG_TYPES.includes(raw.type as StructuredLogResult["type"])
        ? (raw.type as StructuredLogResult["type"])
        : inferHealthType(clause),
      severity: SEVERITY.includes(raw.severity as StructuredLogResult["severity"])
        ? (raw.severity as StructuredLogResult["severity"])
        : inferSeverity(clause),
      title: (raw.title ?? base.health?.title ?? healthTitle(clause)).slice(0, 200),
      summary: (raw.summary ?? base.health?.summary ?? oneLineSummary(clause)).slice(0, 500),
      tags: raw.tags ?? healthTags(clause),
    },
  };
}

export function sanitizeQuickLogEntries(raws: RawQuickEntry[], fullText: string): ParsedQuickLogEntry[] {
  if (!raws.length) return heuristicParseQuickLogNote(fullText);
  const clauses = splitQuickLogClauses(fullText);
  return raws.map((raw, i) => sanitizeQuickLogEntry(raw, raw.clause ?? clauses[i] ?? fullText));
}
