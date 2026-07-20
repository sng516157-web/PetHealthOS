import type { ImportMappedField, ImportPetMapped, ImportSuggestedLog } from "@/lib/data-import-plan";

/** Header alias → canonical field (lowercase keys). */
export const IMPORT_COLUMN_ALIASES: Record<string, ImportMappedField> = {
  name: "name",
  pet_name: "name",
  petname: "name",
  宠物名: "name",
  名称: "name",
  名字: "name",
  species: "species",
  type: "species",
  animal: "species",
  物种: "species",
  种类: "species",
  breed: "breed",
  品种: "breed",
  sex: "sex",
  gender: "sex",
  性别: "sex",
  birth_date: "birthDate",
  birthdate: "birthDate",
  dob: "birthDate",
  date_of_birth: "birthDate",
  出生日期: "birthDate",
  生日: "birthDate",
  color: "color",
  coat: "color",
  毛色: "color",
  颜色: "color",
  weight_kg: "weightKg",
  weight: "weightKg",
  weightkg: "weightKg",
  体重: "weightKg",
  intake_date: "intakeAt",
  intakeat: "intakeAt",
  intake: "intakeAt",
  入舍日期: "intakeAt",
  microchip: "microchip",
  chip: "microchip",
  芯片: "microchip",
  notes: "notes",
  note: "notes",
  备注: "notes",
  sire_name: "sireName",
  sire: "sireName",
  father: "sireName",
  父本: "sireName",
  dam_name: "damName",
  dam: "damName",
  mother: "damName",
  母本: "damName",
  last_vaccine_date: "lastVaccineDate",
  vaccine_date: "lastVaccineDate",
  疫苗日期: "lastVaccineDate",
  last_vaccine_notes: "lastVaccineNotes",
  vaccine_notes: "lastVaccineNotes",
  疫苗备注: "lastVaccineNotes",
  last_deworm_date: "lastDewormDate",
  deworm_date: "lastDewormDate",
  驱虫日期: "lastDewormDate",
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

/** Minimal RFC4180-style CSV parser. */
export function parseCsvText(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && (ch === "\n" || ch === "\r")) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      if (cur.trim()) lines.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  if (cur.trim()) lines.push(cur);

  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string): string[] => {
    const cells: string[] = [];
    let cell = "";
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = !quoted;
        }
        continue;
      }
      if (ch === "," && !quoted) {
        cells.push(cell.trim());
        cell = "";
        continue;
      }
      cell += ch;
    }
    cells.push(cell.trim());
    return cells;
  };

  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cells = parseLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = cells[i] ?? "";
    });
    return row;
  });
  return { headers, rows };
}

function autoColumnMapping(headers: string[]): Record<string, ImportMappedField | null> {
  const mapping: Record<string, ImportMappedField | null> = {};
  for (const h of headers) {
    const key = normalizeHeader(h);
    mapping[h] = IMPORT_COLUMN_ALIASES[key] ?? null;
  }
  return mapping;
}

function cellValue(row: Record<string, string>, header: string | undefined): string {
  if (!header) return "";
  return (row[header] ?? "").trim();
}

function parseSpecies(raw: string): "DOG" | "CAT" | null {
  const v = raw.trim().toLowerCase();
  if (!v) return null;
  if (v === "dog" || v === "犬" || v === "狗" || v.includes("dog")) return "DOG";
  if (v === "cat" || v === "猫" || v.includes("cat")) return "CAT";
  return null;
}

function parseSex(raw: string): "MALE" | "FEMALE" | "UNKNOWN" {
  const v = raw.trim().toLowerCase();
  if (v === "m" || v === "male" || v === "公" || v === "雄") return "MALE";
  if (v === "f" || v === "female" || v === "母" || v === "雌") return "FEMALE";
  return "UNKNOWN";
}

function parseDate(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function parseWeight(raw: string): number {
  const n = Number.parseFloat(raw.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return 1;
  return Math.min(n, 200);
}

export function buildSuggestedLogs(mapped: ImportPetMapped): ImportSuggestedLog[] {
  const logs: ImportSuggestedLog[] = [];
  if (mapped.lastVaccineDate || mapped.lastVaccineNotes) {
    const text = [
      mapped.lastVaccineNotes || "Vaccination record (imported)",
      mapped.lastVaccineDate ? `Date: ${mapped.lastVaccineDate}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    logs.push({
      id: "vaccine",
      type: "MILESTONE",
      title: "Vaccination",
      rawText: text,
      occurredAt: mapped.lastVaccineDate,
      selected: true,
    });
  }
  if (mapped.lastDewormDate) {
    logs.push({
      id: "deworm",
      type: "OBSERVATION",
      title: "Deworming",
      rawText: `Deworming (imported)\nDate: ${mapped.lastDewormDate}`,
      occurredAt: mapped.lastDewormDate,
      selected: true,
    });
  }
  if (mapped.notes) {
    logs.push({
      id: "notes",
      type: "OTHER",
      title: "Imported notes",
      rawText: mapped.notes,
      occurredAt: mapped.birthDate ?? mapped.intakeAt,
      selected: false,
    });
  }
  return logs;
}

export function mapRowToPet(
  row: Record<string, string>,
  columnMapping: Record<string, ImportMappedField | null>,
): ImportPetMapped {
  const pick = (field: ImportMappedField): string => {
    const header = Object.entries(columnMapping).find(([, f]) => f === field)?.[0];
    return cellValue(row, header);
  };

  const species = parseSpecies(pick("species")) ?? "CAT";
  const birthDate = parseDate(pick("birthDate"));
  const intakeAt = parseDate(pick("intakeAt"));

  return {
    name: pick("name") || "Unnamed pet",
    species,
    sex: parseSex(pick("sex")),
    breed: pick("breed") || "Mixed",
    color: pick("color") || "Unknown",
    birthDate,
    intakeAt,
    weightKg: parseWeight(pick("weightKg")),
    microchip: pick("microchip") || null,
    notes: pick("notes") || null,
    sireName: pick("sireName") || null,
    damName: pick("damName") || null,
    lastVaccineDate: parseDate(pick("lastVaccineDate")),
    lastVaccineNotes: pick("lastVaccineNotes") || null,
    lastDewormDate: parseDate(pick("lastDewormDate")),
  };
}

export function buildImportRowsFromCsv(
  csvText: string,
  existing?: { columnMapping?: Record<string, ImportMappedField | null> },
): {
  columnMapping: Record<string, ImportMappedField | null>;
  rows: Array<{
    rowId: string;
    rowIndex: number;
    raw: Record<string, string>;
    mapped: ImportPetMapped;
    suggestedLogs: ImportSuggestedLog[];
  }>;
} {
  const { headers, rows: rawRows } = parseCsvText(csvText);
  const columnMapping = existing?.columnMapping ?? autoColumnMapping(headers);

  const rows = rawRows
    .filter((r) => Object.values(r).some((v) => v.trim()))
    .map((raw, rowIndex) => {
      const mapped = mapRowToPet(raw, columnMapping);
      return {
        rowId: `row-${rowIndex}`,
        rowIndex,
        raw,
        mapped,
        suggestedLogs: buildSuggestedLogs(mapped),
      };
    });

  return { columnMapping, rows };
}
