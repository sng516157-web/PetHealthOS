"use client";

import { createContext, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setTimezone } from "@/app/actions";
import { DEFAULT_TIMEZONE } from "./config";

const TimezoneContext = createContext<string>(DEFAULT_TIMEZONE);

export function TimezoneProvider({
  timeZone,
  children,
}: {
  timeZone: string;
  children: React.ReactNode;
}) {
  return (
    <TimezoneContext.Provider value={timeZone}>{children}</TimezoneContext.Provider>
  );
}

export function useTimezone(): string {
  return useContext(TimezoneContext);
}

/** Detect browser IANA timezone and persist to cookie (refreshes once if it changed). */
export function TimezoneSync({ serverTimeZone }: { serverTimeZone: string }) {
  const router = useRouter();

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected || detected === serverTimeZone) return;
    void setTimezone(detected).then(() => router.refresh());
  }, [serverTimeZone, router]);

  return null;
}
