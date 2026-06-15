export function parseProofDocUrls(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((u): u is string => typeof u === "string")
      : [];
  } catch {
    return [];
  }
}
