/** Cookie set when a visitor clicks a founding-breeder CTA; survives signup + email verify. */
export const FOUNDING_INTENT_COOKIE = "pawsure-founding-intent";

const MAX_AGE_SEC = 7 * 24 * 60 * 60;

export function setFoundingIntentClient(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${FOUNDING_INTENT_COOKIE}=1; path=/; max-age=${MAX_AGE_SEC}; samesite=lax`;
}

export function hasFoundingIntentClient(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim() === `${FOUNDING_INTENT_COOKIE}=1`);
}

export function clearFoundingIntentClient(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${FOUNDING_INTENT_COOKIE}=; path=/; max-age=0`;
}
