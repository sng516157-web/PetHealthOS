"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PawPrint,
  BellRing,
  Bell,
  CreditCard,
  UserCircle,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useI18n } from "@/lib/i18n/client";
import { LocaleToggle } from "@/components/LocaleToggle";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { signOut } from "@/app/actions";

const NAV = [
  { href: "/app", key: "dashboard" as const, icon: LayoutDashboard, exact: true },
  { href: "/app/ai", key: "ai" as const, icon: Sparkles },
  { href: "/app/pets", key: "pets" as const, icon: PawPrint },
  { href: "/app/reminders", key: "reminders" as const, icon: BellRing },
  { href: "/app/notifications", key: "notifications" as const, icon: Bell },
  { href: "/app/billing", key: "billing" as const, icon: CreditCard },
  { href: "/app/account", key: "account" as const, icon: UserCircle },
];

export function Sidebar({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 md:flex">
      <Link href="/app" className="flex items-center gap-2.5 px-2">
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
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-brand-50/60 hover:text-forest"
          >
            <LogOut size={18} className="text-muted" />
            {t.auth.signOut}
          </button>
        </form>
      </div>
    </aside>
  );
}

export function MobileNav({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex min-w-0 items-stretch border-t border-border bg-surface/95 backdrop-blur md:hidden">
      {NAV.map((item) => {
        const active = item.exact
          ? pathname === item.href
          : pathname.startsWith(item.href);
        const Icon = item.icon;
        const label = t.nav.mobile[item.key];
        return (
          <Link
            key={item.href}
            href={item.href}
            title={t.nav[item.key]}
            className={cn(
              "relative flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2 text-[10px] font-medium leading-tight",
              active ? "text-brand-700" : "text-muted",
            )}
          >
            <Icon size={20} className="shrink-0" />
            <span className="max-w-full truncate">{label}</span>
            {item.key === "notifications" && unread > 0 && (
              <span className="absolute right-1/4 top-1.5 h-2 w-2 rounded-full bg-brand-600" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
