/**
 * Neon/Vercel often ship `sslmode=require`. node-pg v8 treats that like
 * `verify-full` but warns that v9 will follow libpq semantics instead.
 * Normalizing here keeps today's behavior and silences the dev warning.
 */
export function normalizePgConnectionString(url?: string): string | undefined {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    const mode = parsed.searchParams.get("sslmode");
    if (mode === "require" || mode === "prefer" || mode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
    }
    return parsed.toString();
  } catch {
    return url.replace(/\bsslmode=(require|prefer|verify-ca)\b/g, "sslmode=verify-full");
  }
}
