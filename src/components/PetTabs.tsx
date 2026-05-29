"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

export function PetTabs({ petId }: { petId: string }) {
  const pathname = usePathname();
  const base = `/pets/${petId}`;
  const tabs = [
    { href: base, label: "Health Log", exact: true },
    { href: `${base}/chat`, label: "AI Assistant" },
    { href: `${base}/triage`, label: "Triage" },
    { href: `${base}/transfer`, label: "Transfer" },
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
