"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

export function PetTabs({
  petId,
  base = `/app/pets/${petId}`,
  includeTransfer = true,
  onlyHealthLog = false,
}: {
  petId: string;
  base?: string;
  includeTransfer?: boolean;
  onlyHealthLog?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const tabs = onlyHealthLog
    ? [{ href: base, label: t.tabs.healthLog, exact: true }]
    : [
        { href: base, label: t.tabs.healthLog, exact: true },
        { href: `${base}/chat`, label: t.tabs.aiAssistant },
        { href: `${base}/triage`, label: t.tabs.triage },
        ...(includeTransfer
          ? [{ href: `${base}/transfer`, label: t.tabs.transfer }]
          : []),
      ];
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
              active ? "text-brand-700" : "text-slate-500 hover:text-foreground",
            )}
          >
            {t.label}
            {active && (
              <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
