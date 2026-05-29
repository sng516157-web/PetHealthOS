"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  BellRing,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import { LocaleToggle } from "@/components/LocaleToggle";

const NAV = [
  { href: "/", key: "dashboard" as const, icon: LayoutDashboard, exact: true },
  { href: "/pets", key: "pets" as const, icon: PawPrint },
  { href: "/reminders", key: "reminders" as const, icon: BellRing },
];

export function Sidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
          <HeartPulse size={20} />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-foreground">
            {t.common.appName}
          </div>
          <div className="text-[11px] text-muted">{t.nav.tagline}</div>
        </div>
      </Link>

      <nav className="mt-7 flex flex-col gap-1">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-foreground",
              )}
            >
              <Icon size={18} className={active ? "text-brand-600" : "text-slate-400"} />
              {t.nav[item.key]}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3">
        <LocaleToggle />
        <div className="rounded-xl border border-border bg-background p-3">
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {t.nav.organization}
          </div>
          <div className="mt-1 truncate text-sm font-semibold text-foreground">
            {orgName}
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-stretch border-t border-border bg-surface/95 backdrop-blur md:hidden">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-brand-600" : "text-slate-500",
            )}
          >
            <Icon size={20} />
            {t.nav[item.key]}
          </Link>
        );
      })}
      <div className="flex items-center px-2">
        <LocaleToggle compact />
      </div>
    </nav>
  );
}
