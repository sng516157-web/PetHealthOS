"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  NotebookPen,
  Sparkles,
  Stethoscope,
  Send,
  Bell,
  Scale,
  FileText,
  Hospital,
  UtensilsCrossed,
  Footprints,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";

type TabDef = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
};

export function PetTabs({
  petId,
  base = `/app/pets/${petId}`,
  includeTransfer = false,
  includeCheckin = false,
  includeAI = true,
  includeTriage = true,
}: {
  petId: string;
  base?: string;
  includeTransfer?: boolean;
  includeCheckin?: boolean;
  includeAI?: boolean;
  includeTriage?: boolean;
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const logPaths = [base, `${base}/food`, `${base}/activity`];
  const onLogSection = logPaths.includes(pathname);

  const mainTabs: TabDef[] = [
    {
      href: base,
      label: t.tabs.logs,
      icon: NotebookPen,
      match: (p) => logPaths.includes(p),
    },
    ...(includeAI
      ? ([
          {
            href: `${base}/chat`,
            label: t.tabs.aiAssistant,
            icon: Sparkles,
            match: (p: string) => p === `${base}/chat` || p.startsWith(`${base}/chat/`),
          },
        ] satisfies TabDef[])
      : []),
    ...(includeTriage
      ? ([
          {
            href: `${base}/triage`,
            label: t.tabs.triage,
            icon: Stethoscope,
            match: (p: string) => p === `${base}/triage` || p.startsWith(`${base}/triage/`),
          },
        ] satisfies TabDef[])
      : []),
    {
      href: `${base}/reminders`,
      label: t.tabs.reminders,
      icon: Bell,
      match: (p) => p === `${base}/reminders` || p.startsWith(`${base}/reminders/`),
    },
    {
      href: `${base}/weight`,
      label: t.tabs.weight,
      icon: Scale,
      match: (p) => p === `${base}/weight` || p.startsWith(`${base}/weight/`),
    },
    {
      href: `${base}/documents`,
      label: t.tabs.documents,
      icon: FileText,
      match: (p) => p === `${base}/documents` || p.startsWith(`${base}/documents/`),
    },
    ...(includeCheckin
      ? ([
          {
            href: `${base}/checkin`,
            label: t.tabs.checkin,
            icon: Hospital,
            match: (p: string) => p === `${base}/checkin` || p.startsWith(`${base}/checkin/`),
          },
        ] satisfies TabDef[])
      : []),
    ...(includeTransfer
      ? ([
          {
            href: `${base}/transfer`,
            label: t.tabs.transfer,
            icon: Send,
            match: (p: string) => p === `${base}/transfer` || p.startsWith(`${base}/transfer/`),
          },
        ] satisfies TabDef[])
      : []),
  ];

  const logSubTabs: TabDef[] = [
    {
      href: base,
      label: t.tabs.quickLog,
      icon: NotebookPen,
      match: (p) => p === base,
    },
    {
      href: `${base}/food`,
      label: t.tabs.foodLog,
      icon: UtensilsCrossed,
      match: (p) => p === `${base}/food` || p.startsWith(`${base}/food/`),
    },
    {
      href: `${base}/activity`,
      label: t.tabs.activityLog,
      icon: Footprints,
      match: (p) => p === `${base}/activity` || p.startsWith(`${base}/activity/`),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {mainTabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors",
                active ? "text-brand-700" : "text-slate-500 hover:text-foreground",
              )}
            >
              <Icon size={15} className={active ? "text-brand-600" : "text-slate-400"} />
              {tab.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
              )}
            </Link>
          );
        })}
      </div>

      {onLogSection && (
        <div className="flex flex-wrap gap-1.5">
          {logSubTabs.map((tab) => {
            const active = tab.match(pathname);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-brand-600 text-white"
                    : "border border-border bg-surface text-slate-600 hover:border-brand-300",
                )}
              >
                <Icon size={13} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
