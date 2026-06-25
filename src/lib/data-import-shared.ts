/** Shared helpers for data-import file refs (safe in client components). */
export function parseImportFileNames(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string")
      : [];
  } catch {
    return [];
  }
}

export function parseImportFileRefs(raw: string): string[] {
  return parseImportFileNames(raw);
}

export const DATA_IMPORT_MAX_PDFS = 20;
export const DATA_IMPORT_MAX_FILE_BYTES = 15 * 1024 * 1024;
