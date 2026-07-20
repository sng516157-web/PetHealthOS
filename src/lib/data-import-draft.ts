import { generateObject } from "ai";
import { z } from "zod";
import { getModel, hasAI } from "@/lib/ai";
import { ATTACHMENT_KINDS, type AttachmentKind } from "@/lib/constants";
import {
  IMPORT_COLUMN_ALIASES,
  buildImportRowsFromCsv,
  buildSuggestedLogs,
  mapRowToPet,
  parseCsvText,
} from "@/lib/data-import-csv";
import type {
  DataImportProcessingState,
  ImportDocumentState,
  ImportMappedField,
  ImportSuggestedLog,
} from "@/lib/data-import-plan";
import {
  emptyProcessingState,
  serializeProcessingState,
} from "@/lib/data-import-plan";
import {
  isCsvFileName,
  isImportDocFileName,
  mimeFromImportFileName,
  parseImportFileNames,
  parseImportFileRefs,
} from "@/lib/data-import-shared";
import { prisma } from "@/lib/prisma";
import { readPrivateDocBytes } from "@/lib/private-doc";

const MAPPED_FIELDS = [
  "name",
  "species",
  "sex",
  "breed",
  "color",
  "birthDate",
  "intakeAt",
  "weightKg",
  "microchip",
  "notes",
  "sireName",
  "damName",
  "lastVaccineDate",
  "lastVaccineNotes",
  "lastDewormDate",
] as const satisfies readonly ImportMappedField[];

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

function autoColumnMapping(headers: string[]): Record<string, ImportMappedField | null> {
  const mapping: Record<string, ImportMappedField | null> = {};
  for (const h of headers) {
    const key = normalizeHeader(h);
    mapping[h] = IMPORT_COLUMN_ALIASES[key] ?? null;
  }
  return mapping;
}

const ColumnMapSchema = z.object({
  mappings: z.array(
    z.object({
      header: z.string(),
      field: z.enum(MAPPED_FIELDS).nullable(),
    }),
  ),
});

/** Fill unmapped headers via Groq; keep deterministic aliases when set. */
export async function suggestColumnMappingWithAi(
  headers: string[],
  sampleRows: Record<string, string>[],
  base: Record<string, ImportMappedField | null>,
): Promise<Record<string, ImportMappedField | null>> {
  const unmapped = headers.filter((h) => !base[h]);
  if (unmapped.length === 0 || !hasAI()) return base;

  try {
    const sample = sampleRows.slice(0, 5);
    const { object } = await generateObject({
      model: getModel(),
      schema: ColumnMapSchema,
      system:
        "You map pet-roster CSV column headers to canonical fields for a pet health passport app. " +
        "Use null when a column is irrelevant (IDs, prices, litter codes you cannot map). " +
        "Prefer name/species/breed/sex/birthDate when ambiguous. Headers may be Chinese (e.g. 宠舍管家).",
      prompt: `Canonical fields: ${MAPPED_FIELDS.join(", ")}\n\nHeaders:\n${headers.join("\n")}\n\nUnmapped headers to resolve:\n${unmapped.join("\n")}\n\nSample rows (JSON):\n${JSON.stringify(sample)}`,
    });

    const next = { ...base };
    const used = new Set(Object.values(next).filter(Boolean) as ImportMappedField[]);
    for (const m of object.mappings) {
      if (!unmapped.includes(m.header)) continue;
      if (!m.field) {
        next[m.header] = null;
        continue;
      }
      if (used.has(m.field)) continue;
      next[m.header] = m.field;
      used.add(m.field);
    }
    return next;
  } catch (e) {
    console.error("suggestColumnMappingWithAi failed", e);
    return base;
  }
}

const DocClassifySchema = z.object({
  kind: z.enum(ATTACHMENT_KINDS),
  label: z.string(),
  petNameHint: z.string().nullable(),
  vaccineOrCareNote: z
    .object({
      title: z.string(),
      rawText: z.string(),
      occurredAt: z.string().nullable(),
    })
    .nullable(),
});

function heuristicDocKind(fileName: string): AttachmentKind {
  const n = fileName.toLowerCase();
  if (/vacc|疫苗|免疫/.test(n)) return "VACCINE_CERT";
  if (/pedigree|血统|系谱|registration/.test(n)) return "PEDIGREE";
  if (/lab|血检|检测|titer|抗体/.test(n)) return "LAB_RESULT";
  if (/\.(jpg|jpeg|png|webp)$/i.test(n)) return "PHOTO";
  return "OTHER";
}

function matchPetIdByName(
  hint: string | null | undefined,
  pets: { id: string; name: string }[],
): string | null {
  if (!hint?.trim()) return null;
  const target = hint.trim().toLowerCase();
  const exact = pets.find((p) => p.name.trim().toLowerCase() === target);
  if (exact) return exact.id;
  const partial = pets.find(
    (p) =>
      p.name.trim().toLowerCase().includes(target) ||
      target.includes(p.name.trim().toLowerCase()),
  );
  return partial?.id ?? null;
}

async function classifyDocumentWithAi(opts: {
  fileName: string;
  mimeType: string;
  bytes: Buffer | null;
  petNames: string[];
}): Promise<{
  kind: AttachmentKind;
  label: string;
  petNameHint: string | null;
  suggestedLog: ImportSuggestedLog | null;
}> {
  const fallback = {
    kind: heuristicDocKind(opts.fileName),
    label: opts.fileName.replace(/\.[^.]+$/i, "") || opts.fileName,
    petNameHint: null as string | null,
    suggestedLog: null as ImportSuggestedLog | null,
  };

  if (!hasAI()) return fallback;

  const isImage = opts.mimeType.startsWith("image/");
  try {
    const system =
      "Classify a pet care document for import into a health passport workspace. " +
      "Pick attachment kind, a short label, and the pet name if visible. " +
      "If this is a vaccine/deworm/care card with a clear date or note, fill vaccineOrCareNote; else null. " +
      `Known pet names (may be empty): ${opts.petNames.join(", ") || "(none yet)"}`;

    const promptText = `File name: ${opts.fileName}\nMIME: ${opts.mimeType}`;

    const { object } =
      isImage && opts.bytes && opts.bytes.byteLength <= 8 * 1024 * 1024
        ? await generateObject({
            model: getModel({ vision: true }),
            schema: DocClassifySchema,
            system,
            messages: [
              {
                role: "user",
                content: [
                  { type: "text", text: promptText },
                  {
                    type: "image",
                    image: new Uint8Array(opts.bytes),
                    mediaType: opts.mimeType,
                  },
                ],
              },
            ],
          })
        : await generateObject({
            model: getModel(),
            schema: DocClassifySchema,
            system,
            prompt: `${promptText}\n\nNo image bytes available — infer from the file name only.`,
          });

    return {
      kind: object.kind,
      label: object.label.trim() || fallback.label,
      petNameHint: object.petNameHint,
      suggestedLog: object.vaccineOrCareNote
        ? {
            id: `doc-${opts.fileName}`,
            type: "MILESTONE",
            title: object.vaccineOrCareNote.title,
            rawText: object.vaccineOrCareNote.rawText,
            occurredAt: object.vaccineOrCareNote.occurredAt,
            selected: true,
          }
        : null,
    };
  } catch (e) {
    console.error("classifyDocumentWithAi failed", e);
    return fallback;
  }
}

/**
 * Build `processingState` from CSV (+ optional AI column map) and classify supporting docs.
 * Sets status READY_FOR_REVIEW on success, or PENDING if drafting fails hard.
 */
export async function draftDataImport(importId: string): Promise<void> {
  const row = await prisma.dataImportRequest.findUnique({ where: { id: importId } });
  if (!row || row.status === "COMPLETED") return;

  try {
    await prisma.dataImportRequest.update({
      where: { id: importId },
      data: { status: "DRAFTING" },
    });

    const fileNames = parseImportFileNames(row.fileNames);
    const fileRefs = parseImportFileRefs(row.fileRefs);
    const state: DataImportProcessingState = emptyProcessingState();

    const existingPets = row.orgId
      ? await prisma.pet.findMany({
          where: { orgId: row.orgId, status: { in: ["ACTIVE", "UNDER_OBSERVATION"] } },
          select: { id: true, name: true },
        })
      : await prisma.pet.findMany({
          where: { ownerUserId: row.userId, status: { not: "DECEASED" } },
          select: { id: true, name: true },
        });

    const csvIndex = fileNames.findIndex(isCsvFileName);
    if (csvIndex >= 0 && fileRefs[csvIndex]) {
      const buf = await readPrivateDocBytes(fileRefs[csvIndex]);
      if (buf) {
        const text = buf.toString("utf-8").replace(/^\uFEFF/, "");
        const parsed = parseCsvText(text);
        let columnMapping = autoColumnMapping(parsed.headers);
        columnMapping = await suggestColumnMappingWithAi(
          parsed.headers,
          parsed.rows,
          columnMapping,
        );
        const built = buildImportRowsFromCsv(text, { columnMapping });
        state.columnMapping = built.columnMapping;
        state.rows = built.rows.map((r) => {
          const mapped = mapRowToPet(r.raw, columnMapping);
          return {
            ...r,
            mapped,
            suggestedLogs: buildSuggestedLogs(mapped),
            status: "pending" as const,
            petId: null,
            skipReason: null,
          };
        });
      }
    }

    const petNames = [
      ...existingPets.map((p) => p.name),
      ...state.rows.map((r) => r.mapped.name),
    ];

    const documents: ImportDocumentState[] = [];

    for (let i = 0; i < fileNames.length; i++) {
      const name = fileNames[i];
      if (!isImportDocFileName(name)) continue;
      const mime = mimeFromImportFileName(name);
      const bytes = fileRefs[i] ? await readPrivateDocBytes(fileRefs[i]) : null;
      const result = await classifyDocumentWithAi({
        fileName: name,
        mimeType: mime,
        bytes,
        petNames,
      });
      const petId = matchPetIdByName(result.petNameHint, existingPets);

      documents.push({
        fileIndex: i,
        fileName: name,
        mimeType: mime,
        petId,
        kind: result.kind,
        label: result.label,
        status: "pending",
        attachmentId: null,
      });

      if (result.suggestedLog && result.petNameHint) {
        const rowIdx = state.rows.findIndex(
          (r) =>
            r.mapped.name.trim().toLowerCase() ===
            result.petNameHint!.trim().toLowerCase(),
        );
        if (rowIdx >= 0) {
          const log = { ...result.suggestedLog, id: `doc-${i}` };
          const existing = state.rows[rowIdx].suggestedLogs;
          if (!existing.some((l) => l.id === log.id)) {
            state.rows[rowIdx] = {
              ...state.rows[rowIdx],
              suggestedLogs: [...existing, log],
            };
          }
        }
      }
    }

    state.documents = documents;

    await prisma.dataImportRequest.update({
      where: { id: importId },
      data: {
        processingState: serializeProcessingState(state),
        status: "READY_FOR_REVIEW",
      },
    });
  } catch (e) {
    console.error("draftDataImport failed", importId, e);
    await prisma.dataImportRequest.update({
      where: { id: importId },
      data: { status: "PENDING" },
    });
  }
}
