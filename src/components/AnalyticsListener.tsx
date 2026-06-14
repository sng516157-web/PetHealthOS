"use client";

import { Suspense, useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  trackEmailVerified,
  trackPageView,
  type AccountSegment,
} from "@/lib/analytics";

function segmentFromPath(path: string): AccountSegment {
  if (path.startsWith("/app")) return "shop";
  if (path.startsWith("/me")) return "owner";
  return "owner";
}

function AnalyticsListenerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    const qs = searchParams.toString();
    const path = qs ? `${pathname}?${qs}` : pathname;
    if (path !== lastPath.current) {
      lastPath.current = path;
      trackPageView(pathname);
    }

    if (searchParams.get("verified") === "1") {
      const key = `pawsure:verified:${pathname}:${searchParams.get("account") ?? ""}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        const acct = searchParams.get("account");
        const segment: AccountSegment =
          acct === "facility" || acct === "shop" || acct === "owner"
            ? acct
            : segmentFromPath(pathname);
        trackEmailVerified(segment);
      }
    }
  }, [pathname, searchParams]);

  return null;
}

export function AnalyticsListener() {
  if (!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()) return null;
  return (
    <Suspense fallback={null}>
      <AnalyticsListenerInner />
    </Suspense>
  );
}
