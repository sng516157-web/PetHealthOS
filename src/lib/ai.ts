import { generateObject, generateText, streamText, type LanguageModel } from "ai";
import { createGroq } from "@ai-sdk/groq";
import { z } from "zod";
import {
  ATTACHMENT_KIND_META,
  LOG_TYPES,
  SEVERITY,
  URGENCY,
  MEAL_TYPES,
  APPETITE_LEVELS,
  ACTIVITY_TYPES,
  ACTIVITY_INTENSITIES,
  MEDICATION_ROUTES,
  type AttachmentKind,
} from "./constants";
import {
  heuristicParseQuickLogNote,
  sanitizeQuickLogEntries,
  type ParsedQuickLogEntry,
} from "./quick-log-classify";
import { formatDateTime, petAge } from "./format";
import { fetchStoredFileBytes, isVisionMime } from "./uploads";
import { DEFAULT_LOCALE, type Locale } from "./i18n/config";

// Instruction appended to every AI prompt so the model replies in the user's UI language.
export function languageInstruction(locale: Locale): string {
  return locale === "zh"
    ? "请使用简体中文回答。所有输出字段（标题、摘要、标签、关注点、建议、问题等）都必须是简体中文。"
    : "Respond in English.";
}

function envKey(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_GROQ_VISION_MODEL = "llama-3.2-90b-vision-preview";

export function hasAI(): boolean {
  return Boolean(envKey("GROQ_API_KEY"));
}

type GetModelOpts = { vision?: boolean };

/** Groq chat model via Vercel AI SDK (`@ai-sdk/groq`). */
export function getModel(opts: GetModelOpts = {}): LanguageModel {
  const groq = createGroq({ apiKey: envKey("GROQ_API_KEY") });
  const modelId = opts.vision
    ? (process.env.GROQ_VISION_MODEL?.trim() || DEFAULT_GROQ_VISION_MODEL)
    : (process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL);
  return groq(modelId);
}

/** Stream plain UTF-8 text to the client (matches ChatPanel reader). */
export function plainTextStreamResponse(text: string): Response {
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();
      const words = text.split(" ");
      let i = 0;
      const timer = setInterval(() => {
        if (i >= words.length) {
          clearInterval(timer);
          controller.close();
          return;
        }
        controller.enqueue(enc.encode(words[i] + " "));
        i++;
      }, 12);
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

/**
 * Pipe a streamText result to the client. If the provider fails or returns no
 * text (common when the API key is missing/invalid), fall back instead of an
 * empty stream — which the UI renders as "…".
 */
export function plainTextResponseFromStreamText(
  result: ReturnType<typeof streamText>,
  fallback: string,
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let acc = "";
      try {
        for await (const delta of result.textStream) {
          acc += delta;
          controller.enqueue(encoder.encode(delta));
        }
      } catch (e) {
        console.error("AI text stream failed:", e);
      }
      if (!acc.trim()) {
        console.error("AI stream returned no text; using fallback response");
        controller.enqueue(encoder.encode(fallback));
      }
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

type PetLike = {
  name: string;
  species: string;
  breed?: string | null;
  sex?: string | null;
  birthDate?: Date | null;
  weightKg?: number | null;
  status?: string;
  notes?: string | null;
};

type LogLike = {
  id: string;
  occurredAt: Date;
  rawText: string;
  type: string;
  severity: string;
  title?: string | null;
  summary?: string | null;
  tags: string;
};

export type FoodLogLike = {
  occurredAt: Date;
  mealType: string;
  foodName?: string | null;
  amount?: string | null;
  appetite?: string | null;
  notes?: string | null;
};

export type ActivityLogLike = {
  occurredAt: Date;
  activityType: string;
  durationMin?: number | null;
  distanceKm?: number | null;
  intensity?: string | null;
  notes?: string | null;
};

export type MedicationLogLike = {
  occurredAt: Date;
  medicationName: string;
  dose?: string | null;
  route?: string | null;
  notes?: string | null;
};

export type AttachmentLike = {
  kind: string;
  label: string;
  url: string;
  mimeType: string | null;
  createdAt: Date;
};

type BuildContextOpts = {
  timeZone?: string;
  locale?: Locale;
};

export function petSummaryLine(pet: PetLike): string {
  const bits = [
    pet.species === "DOG" ? "Dog" : "Cat",
    pet.breed,
    pet.sex && pet.sex !== "UNKNOWN" ? pet.sex.toLowerCase() : null,
    petAge(pet.birthDate),
    pet.weightKg ? `${pet.weightKg} kg` : null,
  ].filter(Boolean);
  return `${pet.name} — ${bits.join(", ")}`;
}

function attachmentKindLabel(kind: string): string {
  const meta = ATTACHMENT_KIND_META[kind as AttachmentKind];
  return meta ? `${meta.emoji} ${meta.label}` : kind;
}

export function buildPetContext(
  pet: PetLike,
  logs: LogLike[],
  attachments: AttachmentLike[] = [],
  opts: BuildContextOpts & {
    foodLogs?: FoodLogLike[];
    activityLogs?: ActivityLogLike[];
    medicationLogs?: MedicationLogLike[];
  } = {},
): string {
  const header = petSummaryLine(pet);
  const notes = pet.notes ? `\nGeneral notes: ${pet.notes}` : "";
  const fmtOpts = { timeZone: opts.timeZone, locale: opts.locale };
  const logLines = logs
    .slice()
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .map((l) => {
      const date = formatDateTime(l.occurredAt, fmtOpts);
      const tags = safeTags(l.tags);
      const tagStr = tags.length ? ` [${tags.join(", ")}]` : "";
      const title = l.title ? ` · ${l.title}` : "";
      return `- ${date} · ${l.type} · severity:${l.severity}${title}${tagStr}\n    ${l.rawText.replace(/\n/g, " ")}`;
    })
    .join("\n");

  const foodLogs = opts.foodLogs ?? [];
  const foodLines = foodLogs
    .slice()
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .map((f) => {
      const date = formatDateTime(f.occurredAt, fmtOpts);
      const bits = [
        f.mealType,
        f.foodName,
        f.amount,
        f.appetite ? `appetite:${f.appetite}` : null,
        f.notes,
      ].filter(Boolean);
      return `- ${date} · ${bits.join(" · ")}`;
    })
    .join("\n");

  const activityLogs = opts.activityLogs ?? [];
  const activityLines = activityLogs
    .slice()
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .map((a) => {
      const date = formatDateTime(a.occurredAt, fmtOpts);
      const bits = [
        a.activityType,
        a.durationMin != null ? `${a.durationMin} min` : null,
        a.distanceKm != null ? `${a.distanceKm} km` : null,
        a.intensity ? `intensity:${a.intensity}` : null,
        a.notes,
      ].filter(Boolean);
      return `- ${date} · ${bits.join(" · ")}`;
    })
    .join("\n");

  const medicationLogs = opts.medicationLogs ?? [];
  const medicationLines = medicationLogs
    .slice()
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .map((m) => {
      const date = formatDateTime(m.occurredAt, fmtOpts);
      const bits = [m.medicationName, m.dose, m.route ? `route:${m.route}` : null, m.notes].filter(Boolean);
      return `- ${date} · ${bits.join(" · ")}`;
    })
    .join("\n");

  const docLines = attachments
    .slice()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((a) => {
      const uploaded = formatDateTime(a.createdAt, fmtOpts);
      const mime = a.mimeType ? ` (${a.mimeType})` : "";
      return `- ${uploaded} · ${attachmentKindLabel(a.kind)} · "${a.label}"${mime}`;
    })
    .join("\n");
  const docsBlock = docLines
    ? `\n\nREFERENCE DOCUMENTS (vaccine certs, lab results, pedigree, etc. — metadata; image/PDF files may also be attached for vision):\n${docLines}`
    : "";
  const foodBlock = foodLines
    ? `\n\nFOOD / NUTRITION LOG (most recent first):\n${foodLines}`
    : "";
  const activityBlock = activityLines
    ? `\n\nACTIVITY / WALKS LOG (most recent first):\n${activityLines}`
    : "";
  const medicationBlock = medicationLines
    ? `\n\nMEDICATION LOG (most recent first):\n${medicationLines}`
    : "";
  const crossHint =
    foodLines || activityLines || medicationLines
      ? "\n\nWhen assessing this pet, cross-reference health symptoms with recent appetite, activity, and medication records where relevant."
      : "";
  return `PET PROFILE\n${header}${notes}\n\nHEALTH LOG (symptoms, vet visits, observations — most recent first):\n${logLines || "(no entries yet)"}${foodBlock}${activityBlock}${medicationBlock}${docsBlock}${crossHint}`;
}

const MAX_VISION_ATTACHMENTS = 4;

/** Load image/PDF bytes for multimodal AI (documents panel). */
export async function loadVisionAttachments(
  attachments: AttachmentLike[],
): Promise<{ data: Uint8Array; mediaType: string; label: string }[]> {
  const out: { data: Uint8Array; mediaType: string; label: string }[] = [];
  for (const a of attachments) {
    if (out.length >= MAX_VISION_ATTACHMENTS) break;
    if (!isVisionMime(a.mimeType)) continue;
    const file = await fetchStoredFileBytes(a.url);
    if (!file || file.data.byteLength > 8 * 1024 * 1024) continue;
    out.push({ ...file, label: `${attachmentKindLabel(a.kind)}: ${a.label}` });
  }
  return out;
}

/** Image attachments only — Groq vision models do not read PDF bytes. */
export function imageVisionAttachments(
  attachments: Awaited<ReturnType<typeof loadVisionAttachments>>,
) {
  return attachments.filter((a) => a.mediaType.startsWith("image/"));
}

export function safeTags(tags: string): string[] {
  try {
    const v = JSON.parse(tags);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

// ---------- Log structuring ----------

const StructuredLog = z.object({
  type: z.enum(LOG_TYPES),
  severity: z.enum(SEVERITY),
  title: z.string().describe("A short 3-6 word headline for this entry"),
  summary: z.string().describe("One clear sentence summarizing the entry"),
  tags: z
    .array(z.string())
    .describe("2-5 lowercase keywords e.g. symptoms, body parts, medications"),
});

export type StructuredLogResult = z.infer<typeof StructuredLog>;

// Optional photo for visual triage — raw bytes + media type (e.g. "image/jpeg").
export type LogImage = { data: Uint8Array; mediaType: string };

export async function structureLogEntry(
  rawText: string,
  pet: PetLike,
  locale: Locale = DEFAULT_LOCALE,
  image?: LogImage,
): Promise<StructuredLogResult> {
  if (!hasAI()) return heuristicStructure(rawText || "Photo log");
  try {
    const system =
      "You are a veterinary intake assistant for a pet breeder/cattery/kennel. Classify a freeform pet health log entry into structured fields. Be conservative about severity. Only mark HIGH or CRITICAL for clearly serious signs (e.g. collapse, seizures, repeated vomiting, blood, difficulty breathing)." +
      (image
        ? " A photo is attached as SUPPORTING context only. The written note is the ground truth: base the classification, summary, tags, and severity on the note. Use the photo only to add corroborating visual detail that is consistent with the note. Do NOT contradict or override the note based on the photo, do NOT infer conditions the note doesn't mention, and if the photo is unclear or off-topic, ignore it. Never invent findings."
        : "") +
      " " +
      languageInstruction(locale);
    const promptText = `Pet: ${petSummaryLine(pet)}\n\nLog entry: "${rawText}"`;

    const { object } = image
      ? await generateObject({
          model: getModel({ vision: true }),
          schema: StructuredLog,
          system,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: promptText },
                { type: "image", image: image.data, mediaType: image.mediaType },
              ],
            },
          ],
        })
      : await generateObject({
          model: getModel(),
          schema: StructuredLog,
          system,
          prompt: promptText,
        });
    return object;
  } catch (e) {
    console.error("structureLogEntry failed, using heuristic", e);
    return heuristicStructure(rawText || "Photo log");
  }
}

export function heuristicStructure(raw: string): StructuredLogResult {
  const t = raw.toLowerCase();
  const has = (...words: string[]) => words.some((w) => t.includes(w));

  let type: StructuredLogResult["type"] = "OBSERVATION";
  if (has("vet", "clinic", "veterinarian", "checkup", "examined")) type = "VET_VISIT";
  else if (has("vomit", "diarrhea", "fever", "sick", "infection", "cough", "sneez", "limp")) type = "ILLNESS";
  else if (has("medication", "med", "pill", "dose", "antibiotic", "tablet", "drops")) type = "MEDICATION";
  else if (has("pain", "uncomfortable", "discomfort", "itch", "scratch", "whining", "crying")) type = "DISCOMFORT";
  else if (has("ate", "food", "feeding", "appetite", "meal", "kibble")) type = "FEEDING";
  else if (has("first", "milestone", "weight gain", "grew", "birthday")) type = "MILESTONE";

  let severity: StructuredLogResult["severity"] = "NONE";
  if (has("collapse", "seizure", "blood", "can't breathe", "cannot breathe", "unconscious", "emergency")) severity = "CRITICAL";
  else if (has("not eating", "won't eat", "lethargic", "repeated", "severe", "high fever")) severity = "HIGH";
  else if (has("vomit", "diarrhea", "limp", "fever", "infection")) severity = "MEDIUM";
  else if (has("pain", "itch", "uncomfortable", "mild", "slightly")) severity = "LOW";

  const words = raw.trim().split(/\s+/);
  const title = words.slice(0, 6).join(" ") + (words.length > 6 ? "…" : "");
  const tags = Array.from(
    new Set(
      [
        "vomit", "diarrhea", "fever", "cough", "appetite", "lethargic",
        "itch", "limp", "vaccine", "medication", "weight",
      ].filter((w) => t.includes(w)),
    ),
  );

  return {
    type,
    severity,
    title: title || "Log entry",
    summary: raw.length > 140 ? raw.slice(0, 137) + "…" : raw,
    tags,
  };
}

const QuickLogEntryItemSchema = z.object({
  route: z.enum(["health", "food", "activity", "medication"]),
  timeHint: z
    .string()
    .nullable()
    .describe("When THIS specific event occurred as written, e.g. '9 am today', '11:30 am'"),
  clause: z.string().optional().describe("The phrase from the note this entry came from"),
  mealType: z.enum(MEAL_TYPES).optional(),
  foodName: z.string().optional(),
  amount: z.string().nullable().optional(),
  appetite: z.enum(APPETITE_LEVELS).optional(),
  foodNotes: z.string().nullable().optional(),
  activityType: z.enum(ACTIVITY_TYPES).optional(),
  durationMin: z.number().nullable().optional(),
  distanceKm: z.number().nullable().optional(),
  intensity: z.enum(ACTIVITY_INTENSITIES).optional(),
  activityNotes: z.string().nullable().optional(),
  medicationName: z.string().optional(),
  dose: z.string().nullable().optional(),
  medRoute: z.enum(MEDICATION_ROUTES).optional(),
  medNotes: z.string().nullable().optional(),
  type: z.enum(LOG_TYPES).optional(),
  severity: z.enum(SEVERITY).optional(),
  title: z.string().describe("Short standardized headline for this entry"),
  summary: z.string().describe("One clear standardized sentence for this entry"),
  tags: z.array(z.string()).optional(),
});

const MultiQuickLogSchema = z.object({
  entries: z
    .array(QuickLogEntryItemSchema)
    .min(1)
    .max(8)
    .describe("One entry per distinct event in the note (walk, meal, medication, symptom, etc.)"),
});

/** Parse a freeform quick note into one or more structured log entries. */
export async function parseQuickLogNote(
  rawText: string,
  pet: PetLike,
  locale: Locale = DEFAULT_LOCALE,
  image?: LogImage,
): Promise<ParsedQuickLogEntry[]> {
  if (!hasAI()) return heuristicParseQuickLogNote(rawText);
  try {
    const system =
      "You parse a freeform pet-care note into one or more structured log entries. Each distinct event (walk, meal, medication dose, symptom like limping or vomiting) becomes its own entry with route health|food|activity|medication. " +
      "For each entry provide a standardized title and summary (not the raw note). Extract timeHint per entry from the text (e.g. '9 am today', '11:30 am'). " +
      "Health = symptoms, illness, limping, vomiting, vet visits. Food = meals/appetite. Activity = walks, play, training. Medication = pills, doses, injections. " +
      "Be conservative on health severity. " +
      languageInstruction(locale);
    const promptText = `Pet: ${petSummaryLine(pet)}\n\nNote: "${rawText}"`;

    const { object } = image
      ? await generateObject({
          model: getModel({ vision: true }),
          schema: MultiQuickLogSchema,
          system,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: promptText },
                { type: "image", image: image.data, mediaType: image.mediaType },
              ],
            },
          ],
        })
      : await generateObject({
          model: getModel(),
          schema: MultiQuickLogSchema,
          system,
          prompt: promptText,
        });
    return sanitizeQuickLogEntries(object.entries, rawText);
  } catch (e) {
    console.error("parseQuickLogNote failed, using heuristic", e);
    return heuristicParseQuickLogNote(rawText);
  }
}

/** @deprecated Use parseQuickLogNote — kept for any single-entry callers */
export async function classifyQuickLogEntry(
  rawText: string,
  pet: PetLike,
  locale: Locale = DEFAULT_LOCALE,
  image?: LogImage,
): Promise<ParsedQuickLogEntry> {
  const entries = await parseQuickLogNote(rawText, pet, locale, image);
  return entries[0] ?? heuristicParseQuickLogNote(rawText)[0];
}

// ---------- Proactive health watch (the guardian) ----------

// Given anomaly signals already detected by rules, write ONE short, calm watch
// note for the caretaker. Returns null when AI is unavailable or fails (the
// caller falls back to a deterministic template). Never diagnoses.
export async function summarizeHealthWatch(opts: {
  pet: PetLike;
  signals: string[];
  recentLogs: LogLike[];
  locale?: Locale;
}): Promise<string | null> {
  const { pet, signals, recentLogs, locale = DEFAULT_LOCALE } = opts;
  if (!hasAI() || signals.length === 0) return null;
  try {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a calm, supportive pet-health guardian. Based ONLY on the provided signals and recent log, write ONE short sentence (max 30 words) telling the caretaker what to keep an eye on and to consider a vet if it persists or worsens. Do not diagnose, do not invent data, no preamble or greeting. " +
        languageInstruction(locale),
      prompt: `${buildPetContext(pet, recentLogs, [], { locale })}\n\nDetected signals: ${signals.join("; ")}\n\nWrite the one-sentence watch note.`,
    });
    return text.trim() || null;
  } catch (e) {
    console.error("summarizeHealthWatch failed", e);
    return null;
  }
}

// ---------- Triage ----------

const TriageSchema = z.object({
  urgency: z.enum(URGENCY),
  summary: z.string().describe("2-3 sentence plain-language overview for the owner"),
  concerns: z
    .array(
      z.object({
        issue: z.string(),
        detail: z.string(),
        severity: z.enum(SEVERITY),
      }),
    )
    .describe("Distinct health concerns drawn from the log"),
  recommendation: z.string().describe("What the owner should do next"),
  vetQuestions: z
    .array(z.string())
    .describe("Specific questions / facts to share with the vet"),
  positiveSigns: z.array(z.string()).describe("Reassuring observations, if any"),
  crossLogInsights: z
    .array(z.string())
    .describe(
      "0-3 brief observations connecting health, food/nutrition, and activity logs (e.g. reduced appetite after low activity). Empty if not applicable.",
    ),
});

export type TriageResult = z.infer<typeof TriageSchema>;

export async function generateTriage(
  pet: PetLike,
  logs: LogLike[],
  locale: Locale = DEFAULT_LOCALE,
  attachments: AttachmentLike[] = [],
  opts: BuildContextOpts & {
    foodLogs?: FoodLogLike[];
    activityLogs?: ActivityLogLike[];
    medicationLogs?: MedicationLogLike[];
  } = {},
): Promise<TriageResult> {
  if (!hasAI()) return heuristicTriage(pet, logs, locale, opts.foodLogs, opts.activityLogs, opts.medicationLogs);
  const context = buildPetContext(pet, logs, attachments, { ...opts, locale });
  const system =
    "You are a veterinary triage assistant. You DO NOT diagnose. You assess urgency and help an owner communicate clearly with a vet, based ONLY on the provided health log, food/nutrition log, activity/walks log, medication log, and reference documents. Cross-reference all log types when patterns are visible (e.g. lethargy + skipped meals + shorter walks). Be calm, practical, and clear. Always recommend professional veterinary care for anything concerning. Never invent data not present in the logs or documents. " +
    languageInstruction(locale);
  const prompt = `${context}\n\nProduce a triage assessment for communicating with a veterinarian.`;
  try {
    const vision = imageVisionAttachments(await loadVisionAttachments(attachments));
    if (vision.length > 0) {
      const { object } = await generateObject({
        model: getModel({ vision: true }),
        schema: TriageSchema,
        system,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...vision.map((v) => ({
                type: "image" as const,
                image: v.data,
                mediaType: v.mediaType,
              })),
            ],
          },
        ],
      });
      return object;
    }
    const { object } = await generateObject({
      model: getModel(),
      schema: TriageSchema,
      system,
      prompt,
    });
    return object;
  } catch (e) {
    console.error("generateTriage failed, using heuristic", e);
    return heuristicTriage(pet, logs, locale, opts.foodLogs, opts.activityLogs, opts.medicationLogs);
  }
}

function heuristicTriage(
  pet: PetLike,
  logs: LogLike[],
  locale: Locale = DEFAULT_LOCALE,
  foodLogs: FoodLogLike[] = [],
  activityLogs: ActivityLogLike[] = [],
  _medicationLogs: MedicationLogLike[] = [],
): TriageResult {
  const recent = logs
    .filter((l) => l.occurredAt.getTime() > Date.now() - 1000 * 60 * 60 * 24 * 14)
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  const rank: Record<string, number> = {
    NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
  };
  const concerns = recent
    .filter((l) => rank[l.severity] >= 2)
    .map((l) => ({
      issue: l.title || l.type,
      detail: l.summary || l.rawText,
      severity: l.severity as TriageResult["concerns"][number]["severity"],
    }));

  const maxRank = concerns.reduce((m, c) => Math.max(m, rank[c.severity]), 0);
  const urgency: TriageResult["urgency"] =
    maxRank >= 4 ? "EMERGENCY" : maxRank === 3 ? "URGENT" : maxRank === 2 ? "SOON" : concerns.length ? "MONITOR" : "ROUTINE";

  const crossLogInsights: string[] = [];
  const refusedMeals = foodLogs.filter((f) => f.appetite === "REFUSED").length;
  const lowActivity = activityLogs.filter(
    (a) => (a.durationMin ?? 0) < 15 && a.activityType === "WALK",
  ).length;
  if (refusedMeals > 0 && concerns.length > 0) {
    crossLogInsights.push(
      locale === "zh"
        ? "近期有拒食记录，且健康日志中有需要关注的事项——请告知兽医食欲变化的时间线。"
        : "Recent refused meals alongside health concerns — tell your vet when appetite changed.",
    );
  }
  if (lowActivity > 0 && concerns.some((c) => /tired|letharg|fatigue|精神|乏力|没精神/i.test(c.detail))) {
    crossLogInsights.push(
      locale === "zh"
        ? "活动量减少且日志提到精神不振——可能与不适有关。"
        : "Shorter walks logged alongside tiredness — activity drop may relate to how they feel.",
    );
  }

  if (locale === "zh") {
    return {
      urgency,
      summary: concerns.length
        ? `${pet.name} 近期记录中有 ${concerns.length} 项值得注意的内容。这是基于规则的总结 —— 连接 AI 密钥可获得更深入的评估。`
        : `过去两周内未发现 ${pet.name} 有明显需要关注的问题。`,
      concerns,
      recommendation: concerns.length
        ? "请把这份报告分享给你的兽医，并密切观察。"
        : "继续日常护理并坚持记录。",
      vetQuestions: concerns.map((c) => `可能的原因是什么：${c.issue}？`),
      positiveSigns: [],
      crossLogInsights,
    };
  }

  return {
    urgency,
    summary: concerns.length
      ? `${pet.name} has ${concerns.length} notable item(s) in the recent log. This is a rule-based summary — connect an AI key for a richer assessment.`
      : `No significant concerns logged for ${pet.name} in the last 2 weeks.`,
    concerns,
    recommendation: concerns.length
      ? "Share this report with your veterinarian and monitor closely."
      : "Continue routine care and logging.",
    vetQuestions: concerns.map((c) => `What could explain: ${c.issue}?`),
    positiveSigns: [],
    crossLogInsights,
  };
}

// ---------- Org workspace AI (shop / facility — all pets in care) ----------

export type OrgPetContextPack = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  status: string;
  birthDate: Date | null;
  weightKg: number | null;
  logs: LogLike[];
  foodLogs?: FoodLogLike[];
  activityLogs?: ActivityLogLike[];
};

export function buildOrgCareContext(
  orgName: string,
  facility: boolean,
  pets: OrgPetContextPack[],
  opts: BuildContextOpts = {},
): string {
  const role = facility
    ? "veterinary clinic / boarding facility"
    : "breeder, cattery, kennel, or pet shop";
  const header =
    opts.locale === "zh"
      ? `工作区：${orgName}（${role}）\n当前照护中的宠物（${pets.length} 只）：\n`
      : `WORKSPACE: ${orgName} (${role})\nPets currently in care (${pets.length}):\n`;

  if (pets.length === 0) {
    return (
      header +
      (opts.locale === "zh"
        ? "（暂无在照护中的宠物）"
        : "(No pets currently in care)")
    );
  }

  const blocks = pets.map((pet) => {
    const statusNote =
      pet.status === "UNDER_OBSERVATION"
        ? opts.locale === "zh"
          ? " · 状态：观察中"
          : " · status: UNDER_OBSERVATION"
        : "";
    const body = buildPetContext(pet, pet.logs, [], {
      ...opts,
      foodLogs: pet.foodLogs,
      activityLogs: pet.activityLogs,
    });
    return `=== ${pet.name} (id:${pet.id}${statusNote}) ===\n${body}`;
  });

  return `${header}\n${blocks.join("\n\n")}`;
}

const OrgWardTriageSchema = z.object({
  summary: z.string().describe("2-4 sentence overview for the whole roster"),
  watchList: z
    .array(
      z.object({
        petName: z.string(),
        reason: z.string(),
        urgency: z.enum(URGENCY),
      }),
    )
    .describe("Pets that need extra attention, most urgent first"),
  teamNotes: z
    .array(z.string())
    .describe("Actionable notes for staff — rounds, follow-ups, owner updates"),
});

export type OrgWardTriageResult = z.infer<typeof OrgWardTriageSchema>;

export function heuristicOrgWardTriage(
  pets: OrgPetContextPack[],
  locale: Locale = DEFAULT_LOCALE,
): OrgWardTriageResult {
  const rank: Record<string, number> = {
    NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
  };
  const twoWeeks = Date.now() - 1000 * 60 * 60 * 24 * 14;
  const watchList: OrgWardTriageResult["watchList"] = [];

  for (const pet of pets) {
    const recent = pet.logs.filter((l) => l.occurredAt.getTime() > twoWeeks);
    const maxSev = recent.reduce((m, l) => Math.max(m, rank[l.severity] ?? 0), 0);
    const underWatch = pet.status === "UNDER_OBSERVATION";
    const refused = (pet.foodLogs ?? []).some((f) => f.appetite === "REFUSED");
    if (!underWatch && maxSev < 2 && !refused) continue;

    const last = recent[0];
    const urgency: OrgWardTriageResult["watchList"][number]["urgency"] =
      maxSev >= 4 ? "EMERGENCY" : maxSev >= 3 ? "URGENT" : maxSev >= 2 ? "SOON" : "MONITOR";

    const reason =
      locale === "zh"
        ? underWatch
          ? "标记为观察中"
          : last?.title || last?.rawText?.slice(0, 80) || "近期记录需关注"
        : underWatch
          ? "Marked under observation"
          : last?.title || last?.rawText?.slice(0, 80) || "Recent log needs review";

    watchList.push({ petName: pet.name, reason, urgency });
  }

  watchList.sort(
    (a, b) =>
      ({ EMERGENCY: 4, URGENT: 3, SOON: 2, MONITOR: 1, ROUTINE: 0 }[b.urgency] ?? 0) -
      ({ EMERGENCY: 4, URGENT: 3, SOON: 2, MONITOR: 1, ROUTINE: 0 }[a.urgency] ?? 0),
  );

  if (locale === "zh") {
    return {
      summary:
        watchList.length > 0
          ? `共 ${pets.length} 只宠物在照护中，${watchList.length} 只需要额外关注。这是基于规则的概览 —— 连接 AI 密钥可获得更完整的分析。`
          : `${pets.length} 只宠物在照护中，近期未发现明显需优先处理的事项。`,
      watchList,
      teamNotes: watchList.length
        ? ["优先查看观察中或高严重度记录的宠物", "如有变化，及时更新日志并通知主人"]
        : ["继续按计划记录护理", "下次巡房时复查食欲与活动量"],
    };
  }

  return {
    summary:
      watchList.length > 0
        ? `${pets.length} pets in care; ${watchList.length} need extra attention. Rule-based overview — connect an AI key for deeper analysis.`
        : `${pets.length} pets in care with no obvious priority flags in recent logs.`,
    watchList,
    teamNotes: watchList.length
      ? ["Review under-observation pets and high-severity logs first", "Log changes and notify owners when needed"]
      : ["Keep routine logging on schedule", "Recheck appetite and activity on rounds"],
  };
}

export async function generateOrgWardTriage(
  orgName: string,
  facility: boolean,
  pets: OrgPetContextPack[],
  locale: Locale = DEFAULT_LOCALE,
  opts: BuildContextOpts = {},
): Promise<OrgWardTriageResult> {
  if (!hasAI()) return heuristicOrgWardTriage(pets, locale);
  const context = buildOrgCareContext(orgName, facility, pets, { ...opts, locale });
  const role = facility ? "care facility staff" : "breeder/shop staff";
  const system =
    `You are a veterinary triage assistant helping ${role} prioritize pets across an entire roster. You DO NOT diagnose. Based ONLY on the provided multi-pet records, produce a ward-round style briefing: who needs attention first and why. Never invent data. ` +
    languageInstruction(locale);
  const prompt = `${context}\n\nProduce a workspace-wide triage briefing for all pets currently in care.`;
  try {
    const { object } = await generateObject({
      model: getModel(),
      schema: OrgWardTriageSchema,
      system,
      prompt,
    });
    return object;
  } catch (e) {
    console.error("generateOrgWardTriage failed, using heuristic", e);
    return heuristicOrgWardTriage(pets, locale);
  }
}

export function orgAiSystemPrompt(
  orgName: string,
  facility: boolean,
  locale: Locale,
  context: string,
): string {
  const role = facility
    ? "veterinary clinic / boarding facility"
    : "breeder, cattery, kennel, or pet shop";
  const audience = facility
    ? "You support facility staff managing many pets during active stays."
    : "You support shop staff managing many pets before handover.";

  return `You are the workspace AI for ${orgName}, a ${role}. ${audience}

You have access to ALL pets currently in care — their health, food, and activity logs in the roster below.

Rules:
- Answer roster-wide questions: who needs attention, compare pets, summarize trends, prioritize rounds, draft owner updates.
- Reference pets by name; you may compare multiple animals in one answer.
- Cross-reference health, food, and activity logs when patterns matter.
- You are NOT a veterinarian — no definitive diagnoses. Recommend professional care when concerning.
- Be warm, concise, practical. Use short paragraphs or bullets.
- ${languageInstruction(locale)}

${context}`;
}

export function mockPetChatReply(
  pet: PetLike,
  logs: LogLike[],
  attachments: AttachmentLike[],
  question: string,
  locale: Locale = DEFAULT_LOCALE,
  extra: {
    foodLogs?: FoodLogLike[];
    activityLogs?: ActivityLogLike[];
    medicationLogs?: MedicationLogLike[];
  } = {},
): string {
  const recentHealth = logs.slice(0, 3);
  const recentFood = (extra.foodLogs ?? []).slice(0, 2);
  const recentActivity = (extra.activityLogs ?? []).slice(0, 2);
  const recentMed = (extra.medicationLogs ?? []).slice(0, 2);
  const docs = attachments.slice(0, 3);
  const lines: string[] = [];
  const zh = locale === "zh";
  const hasAny =
    recentHealth.length > 0 ||
    recentFood.length > 0 ||
    recentActivity.length > 0 ||
    recentMed.length > 0;

  lines.push(
    zh
      ? `以下是我在 ${pet.name} 的档案中看到的内容（演示模式 —— 未连接 AI 密钥）：\n`
      : `Here's what I can see in ${pet.name}'s records (demo mode — no AI key connected):\n`,
  );

  if (!hasAny) {
    lines.push(
      zh
        ? `目前还没有记录。在『快速记录』中添加内容，我就能据此为你分析。`
        : `There are no log entries yet. Add notes via Quick Log and I'll be able to reason about them.`,
    );
  } else {
    if (recentHealth.length > 0) {
      lines.push(zh ? `**健康记录：**` : `**Health:**`);
      for (const l of recentHealth) {
        const tags = safeTags(l.tags);
        lines.push(
          `- ${l.occurredAt.toISOString().slice(0, 10)} · ${l.title || l.type} (severity ${l.severity})${tags.length ? ` — ${tags.join(", ")}` : ""}`,
        );
      }
    }
    if (recentFood.length > 0) {
      lines.push(zh ? `**饮食：**` : `**Food & nutrition:**`);
      for (const f of recentFood) {
        lines.push(`- ${f.occurredAt.toISOString().slice(0, 10)} · ${f.foodName ?? f.mealType}`);
      }
    }
    if (recentActivity.length > 0) {
      lines.push(zh ? `**活动：**` : `**Activity:**`);
      for (const a of recentActivity) {
        lines.push(`- ${a.occurredAt.toISOString().slice(0, 10)} · ${a.activityType}${a.durationMin ? ` (${a.durationMin} min)` : ""}`);
      }
    }
    if (recentMed.length > 0) {
      lines.push(zh ? `**用药：**` : `**Medication:**`);
      for (const m of recentMed) {
        lines.push(`- ${m.occurredAt.toISOString().slice(0, 10)} · ${m.medicationName}`);
      }
    }
  }
  if (docs.length > 0) {
    lines.push(zh ? `\n**参考文件：**` : `\n**Reference documents:**`);
    for (const d of docs) {
      lines.push(`- ${d.kind}: ${d.label}`);
    }
  }
  lines.push(
    zh
      ? `\n你问的是：“${question}”。连接 AI 密钥后（设置 GROQ_API_KEY），我就能基于上面 ${petSummaryLine(pet)} 的完整历史与文件，用自然语言回答这个问题。如有任何令人担心的情况，请咨询兽医。`
      : `\nYou asked: "${question}". With an AI key connected (set GROQ_API_KEY), I'd answer this in natural language grounded in ${petSummaryLine(pet)}'s full history and documents above. For anything concerning, please consult a veterinarian.`,
  );
  return lines.join("\n");
}

export function mockOrgChatReply(
  orgName: string,
  facility: boolean,
  pets: OrgPetContextPack[],
  question: string,
  locale: Locale,
): string {
  const briefing = heuristicOrgWardTriage(pets, locale);
  const zh = locale === "zh";
  const lines: string[] = [
    zh
      ? `**${orgName} 工作区 AI（演示模式）**\n`
      : `**${orgName} workspace AI (demo mode)**\n`,
    briefing.summary,
  ];
  if (briefing.watchList.length > 0) {
    lines.push(zh ? "\n**建议优先关注：**" : "\n**Priority watch list:**");
    for (const w of briefing.watchList.slice(0, 5)) {
      lines.push(`- **${w.petName}** — ${w.reason} (${w.urgency})`);
    }
  }
  lines.push(
    zh
      ? `\n你问的是：“${question}”。连接 AI 密钥后，我会基于全部 ${pets.length} 只宠物的记录用自然语言回答。`
      : `\nYou asked: "${question}". With an AI key connected, I'd answer in natural language using all ${pets.length} pets' records.`,
  );
  return lines.join("\n");
}
