"use client";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export type AccountSegment = "owner" | "shop" | "facility";

export function trackEvent(
  name: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}

export function trackPageView(path: string) {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id || typeof window.gtag !== "function") return;
  window.gtag("config", id, { page_path: path });
}

export function trackSignUp(accountType: AccountSegment) {
  trackEvent("sign_up", { method: "email", account_type: accountType });
}

export function trackEmailVerified(accountType: AccountSegment) {
  trackEvent("email_verified", { account_type: accountType });
}

export function trackBeginCheckout(opts: {
  accountType: AccountSegment;
  product: string;
  valueUsd?: number;
}) {
  trackEvent("begin_checkout", {
    account_type: opts.accountType,
    item_name: opts.product,
    currency: "USD",
    value: opts.valueUsd,
  });
}

export function trackPurchase(opts: {
  accountType: AccountSegment;
  product?: string;
}) {
  trackEvent("purchase", {
    account_type: opts.accountType,
    item_name: opts.product ?? "subscription",
    currency: "USD",
  });
}
