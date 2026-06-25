import type { AttachmentKind } from "@/lib/constants";

/** Canonical import plan — stable shape for manual review and future AI automation. */
export const IMPORT_PLAN_VERSION = 1 as const;

export type ImportMappedField =
  | "name"
  | "species"
  | "sex"
  | "breed"
  | "color"
  | "birthDate"
  | "intakeAt"
  | "weightKg"
  | "microchip"
  | "notes"
  | "sireName"
  | "damName"
  | "lastVaccineDate"
  | "lastVaccineNotes"
  | "lastDewormDate";

export type ImportPetMapped = {
  name: string;
  species: "DOG" | "CAT";
  sex: "MALE" | "FEMALE" | "UNKNOWN";
  breed: string;
  color: string;
  birthDate: string | null;
  intakeAt: string | null;
  weightKg: number;
  microchip: string | null;
  notes: string | null;
  sireName: string | null;
  damName: string | null;
  lastVaccineDate: string | null;
  lastVaccineNotes: string | null;
  lastDewormDate: string | null;
};

export type ImportSuggestedLog = {
  id: string;
  type: "MILESTONE" | "OBSERVATION" | "OTHER";
  title: string;
  rawText: string;
  occurredAt: string | null;
  selected: boolean;
};

export type ImportRowState = {
  rowId: string;
  rowIndex: number;
  raw: Record<string, string>;
  mapped: ImportPetMapped;
  suggestedLogs: ImportSuggestedLog[];
  status: "pending" | "skipped" | "applied";
  petId: string | null;
  skipReason: string | null;
};

export type ImportDocumentState = {
  fileIndex: number;
  fileName: string;
  mimeType: string;
  petId: string | null;
  kind: AttachmentKind;
  label: string;
  status: "pending" | "skipped" | "applied";
  attachmentId: string | null;
};

export type ImportAppliedAction = {
  id: string;
  at: string;
  kind: "pet" | "log" | "weight" | "document";
  summary: string;
  entityId: string;
  rowId?: string;
  fileIndex?: number;
};

export type DataImportProcessingState = {
  version: typeof IMPORT_PLAN_VERSION;
  columnMapping: Record<string, ImportMappedField | null>;
  rows: ImportRowState[];
  documents: ImportDocumentState[];
  applied: ImportAppliedAction[];
};

export function emptyProcessingState(): DataImportProcessingState {
  return {
    version: IMPORT_PLAN_VERSION,
    columnMapping: {},
    rows: [],
    documents: [],
    applied: [],
  };
}

export function parseProcessingState(raw: string | null | undefined): DataImportProcessingState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DataImportProcessingState;
    if (parsed?.version !== IMPORT_PLAN_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function serializeProcessingState(state: DataImportProcessingState): string {
  return JSON.stringify(state);
}
