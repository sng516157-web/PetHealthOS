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

export const DATA_IMPORT_MAX_DOCS = 20;
/** @deprecated use DATA_IMPORT_MAX_DOCS */
export const DATA_IMPORT_MAX_PDFS = DATA_IMPORT_MAX_DOCS;
export const DATA_IMPORT_MAX_FILE_BYTES = 15 * 1024 * 1024;

export function isCsvFileName(name: string): boolean {
  return name.toLowerCase().endsWith(".csv");
}

export function isImportDocFileName(name: string): boolean {
  const n = name.toLowerCase();
  return (
    n.endsWith(".pdf") ||
    n.endsWith(".jpg") ||
    n.endsWith(".jpeg") ||
    n.endsWith(".png") ||
    n.endsWith(".webp")
  );
}

export function mimeFromImportFileName(name: string): string {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "csv") return "text/csv";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  return "application/octet-stream";
}
