"use client";

import { useEffect } from "react";
import { setFoundingIntentClient } from "@/lib/founding-intent";

/** Persists `?founding=1` into the founding-intent cookie for post-signup checkout. */
export function FoundingIntentSync({ active }: { active: boolean }) {
  useEffect(() => {
    if (active) setFoundingIntentClient();
  }, [active]);
  return null;
}
