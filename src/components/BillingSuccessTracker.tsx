"use client";

import { useEffect, useRef } from "react";
import { trackPurchase, type AccountSegment } from "@/lib/analytics";

export function BillingSuccessTracker({
  state,
  scopeKind,
  sessionId,
}: {
  state: "success" | "pending" | "failed" | "missing";
  scopeKind?: string;
  sessionId?: string;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (state !== "success" || fired.current) return;
    fired.current = true;
    const key = `pawsure:purchase:${sessionId ?? "unknown"}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    let accountType: AccountSegment = "owner";
    if (scopeKind === "org" || scopeKind === "org_slot") accountType = "shop";

    trackPurchase({
      accountType,
      product: scopeKind ?? "subscription",
    });
  }, [state, scopeKind, sessionId]);

  return null;
}
