/** Search/social crawlers — always serve English SSR for indexing & link previews. */
const BOT_UA =
  /googlebot|google-inspectiontool|googleother|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|applebot|semrushbot|ahrefsbot|mj12bot|petalbot|bytespider/i;

export function isSearchEngineBot(
  userAgent: string | null | undefined,
): boolean {
  if (!userAgent) return false;
  return BOT_UA.test(userAgent);
}

export function isSearchEngineBotHeaders(
  headers: Headers | { get(name: string): string | null },
): boolean {
  return isSearchEngineBot(headers.get("user-agent"));
}
