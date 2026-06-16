"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Send,
  NotebookPen,
  Sparkles,
  Stethoscope,
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
  match?: (pathname: string, href: string) => boolean;
};

const DEMO_BASE = "/demo/pet-nav";
const SHOP_BASE = "/demo/pet-nav/shop";

export function PetNavDemoTabs({
  showCheckin = true,
  variant = "owner",
}: {
  showCheckin?: boolean;
  variant?: "owner" | "shop";
}) {
  const pathname = usePathname();
  const { t } = useI18n();

  const base = variant === "shop" ? SHOP_BASE : DEMO_BASE;
  const logPaths = [base, `${base}/food`, `${base}/activity`];

  const mainTabs: TabDef[] = [
    {
      href: base,
      label: t.tabs.logs,
      icon: NotebookPen,
      match: (p) => logPaths.includes(p),
    },
    { href: `${base}/chat`, label: t.tabs.aiAssistant, icon: Sparkles },
    { href: `${base}/triage`, label: t.tabs.triage, icon: Stethoscope },
    { href: `${base}/reminders`, label: t.tabs.reminders, icon: Bell },
    { href: `${base}/weight`, label: t.tabs.weight, icon: Scale },
    { href: `${base}/documents`, label: t.tabs.documents, icon: FileText },
    ...(showCheckin
      ? [{ href: `${base}/checkin`, label: t.tabs.checkin, icon: Hospital }]
      : []),
    ...(variant === "shop"
      ? [{ href: `${base}/transfer`, label: t.tabs.transfer, icon: Send }]
      : []),
  ];

  const logSubTabs: TabDef[] = [
    { href: base, label: t.tabs.quickLog, icon: NotebookPen },
    { href: `${base}/food`, label: t.tabs.foodLog, icon: UtensilsCrossed },
    { href: `${base}/activity`, label: t.tabs.activityLog, icon: Footprints },
  ];

  const onLogSection =
    logPaths.includes(pathname) && !(variant === "shop" && pathname === SHOP_BASE);

  return (
    <div className="space-y-3">
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {mainTabs.map((tab) => {
          const active = tab.match
            ? tab.match(pathname, tab.href)
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-sm font-medium transition-colors",
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
            const active = pathname === tab.href;
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
