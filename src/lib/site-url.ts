import { headers } from "next/headers";

/** HK proxy domain reachable from mainland China without a VPN. */
export const DEFAULT_PUBLIC_APP_URL = "https://pethealthos.online";

/** Public site URL for browser redirects (Stripe return URLs, emails, etc.). */
export function canonicalAppUrl(): string | null {
  const raw = process.env.APP_PUBLIC_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  // Production default: never send Stripe back to *.vercel.app (GFW-blocked).
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return DEFAULT_PUBLIC_APP_URL;
  }
  return null;
}

function isBlockedCheckoutHost(host: string): boolean {
  return host.includes("vercel.app") || host.includes("localhost");
}

/**
 * Base URL for Stripe Checkout success/cancel redirects.
 * Always prefer the mainland-reachable proxy domain in production so the
 * post-payment browser redirect does not hang on *.vercel.app.
 */
export async function checkoutBaseUrl(): Promise<string> {
  const canonical = canonicalAppUrl();
  if (canonical) return canonical;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  if (isBlockedCheckoutHost(host)) {
    return DEFAULT_PUBLIC_APP_URL;
  }
  return `${proto}://${host}`;
}