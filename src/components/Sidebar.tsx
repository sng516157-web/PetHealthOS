"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  BellRing,
  Bell,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import { LocaleToggle } from "@/components/LocaleToggle";
import { PawSureMarkTile } from "@/components/PawSureLogo";

const NAV = [
  { href: "/", key: "dashboard" as const, icon: LayoutDashboard, exact: true },
  { href: "/pets", key: "pets" as const, icon: PawPrint },
  { href: "/reminders", key: "reminders" as const, icon: BellRing },
  { href: "/notifications", key: "notifications" as const, icon: Bell },
  { href: "/billing", key: "billing" as const, icon: CreditCard },
];

export function Sidebar({ orgName, unread = 0 }: { orgName: string; unread?: number }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 md:flex">
      <Link href="/" className="flex items-center gap-2.5 px-2">
        <PawSureMarkTile className="h-9 w-9" />
        <div className="leading-tight">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-forest">PawSure</span>
            <span className="font-cn text-xs font-bold text-forest/70">宠诺</span>
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
                  ? "bg-brand-50 text-brand-800"
                  : "text-muted hover:bg-brand-50/60 hover:text-forest",
              )}
            >
              <Icon size={18} className={active ? "text-brand-600" : "text-muted"} />
              {t.nav[item.key]}
              {item.key === "notifications" && unread > 0 && (
                <span className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-semibold text-white">
                  {unread}
                </span>
              )}
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

export function MobileNav({ unread = 0 }: { unread?: number }) {
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
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium",
              active ? "text-brand-700" : "text-muted",
            )}
          >
            <Icon size={20} />
            {item.key === "notifications" && unread > 0 && (
              <span className="absolute right-1/4 top-1.5 h-2 w-2 rounded-full bg-brand-600" />
            )}
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
