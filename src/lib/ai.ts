import { generateObject, generateText, type LanguageModel } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { LOG_TYPES, SEVERITY, URGENCY } from "./constants";
import { petAge } from "./format";
import type { Locale } from "./i18n/config";

// Instruction appended to every AI prompt so the model replies in the user's UI language.
export function languageInstruction(locale: Locale): string {
  return locale === "zh"
    ? "请使用简体中文回答。所有输出字段（标题、摘要、标签、关注点、建议、问题等）都必须是简体中文。"
    : "Respond in English.";
}

export function hasAI(): boolean {
  return Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.AI_GATEWAY_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY,
  );
}

// Resolve the active model. Prefer a directly-wired Google Gemini key; otherwise
// fall back to a Vercel AI Gateway "provider/model" string.
export function getModel(): LanguageModel {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google(process.env.GOOGLE_AI_MODEL ?? "gemini-2.5-flash");
  }
  return (process.env.AI_MODEL ?? "openai/gpt-4o-mini") as LanguageModel;
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

export function buildPetContext(pet: PetLike, logs: LogLike[]): string {
  const header = petSummaryLine(pet);
  const notes = pet.notes ? `\nGeneral notes: ${pet.notes}` : "";
  const logLines = logs
    .slice()
    .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
    .map((l) => {
      const date = l.occurredAt.toISOString().slice(0, 10);
      const tags = safeTags(l.tags);
      const tagStr = tags.length ? ` [${tags.join(", ")}]` : "";
      return `- ${date} · ${l.type} · severity:${l.severity}${tagStr}\n    ${l.rawText.replace(/\n/g, " ")}`;
    })
    .join("\n");
  return `PET PROFILE\n${header}${notes}\n\nHEALTH LOG (most recent first):\n${logLines || "(no entries yet)"}`;
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
  locale: Locale = "en",
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
          model: getModel(),
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
  const { pet, signals, recentLogs, locale = "en" } = opts;
  if (!hasAI() || signals.length === 0) return null;
  try {
    const { text } = await generateText({
      model: getModel(),
      system:
        "You are a calm, supportive pet-health guardian. Based ONLY on the provided signals and recent log, write ONE short sentence (max 30 words) telling the caretaker what to keep an eye on and to consider a vet if it persists or worsens. Do not diagnose, do not invent data, no preamble or greeting. " +
        languageInstruction(locale),
      prompt: `${buildPetContext(pet, recentLogs)}\n\nDetected signals: ${signals.join("; ")}\n\nWrite the one-sentence watch note.`,
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
});

export type TriageResult = z.infer<typeof TriageSchema>;

export async function generateTriage(
  pet: PetLike,
  logs: LogLike[],
  locale: Locale = "en",
): Promise<TriageResult> {
  if (!hasAI()) return heuristicTriage(pet, logs, locale);
  try {
    const { object } = await generateObject({
      model: getModel(),
      schema: TriageSchema,
      system:
        "You are a veterinary triage assistant. You DO NOT diagnose. You assess urgency and help an owner communicate clearly with a vet, based ONLY on the provided health log. Be calm, practical, and clear. Always recommend professional veterinary care for anything concerning. Never invent data not present in the log. " +
        languageInstruction(locale),
      prompt: `${buildPetContext(pet, logs)}\n\nProduce a triage assessment for communicating with a veterinarian.`,
    });
    return object;
  } catch (e) {
    console.error("generateTriage failed, using heuristic", e);
    return heuristicTriage(pet, logs, locale);
  }
}

function heuristicTriage(pet: PetLike, logs: LogLike[], locale: Locale = "en"): TriageResult {
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
  };
}
