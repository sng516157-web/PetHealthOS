"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  PawPrint,
  BellRing,
  Bell,
  CreditCard,
  UserCircle,
} from "lucide-react";
import { PawSureMarkTile } from "@/components/PawSureLogo";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: PawPrint, label: "Pets" },
  { icon: BellRing, label: "Reminders" },
  { icon: Bell, label: "Notifications" },
  { icon: CreditCard, label: "Billing" },
  { icon: UserCircle, label: "Account" },
];

export function DemoWorkspaceShell({
  orgName,
  children,
}: {
  orgName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] bg-paper">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 md:flex">
        <div className="flex items-center gap-2.5 px-2">
          <PawSureMarkTile className="h-9 w-9" />
          <div className="leading-tight">
            <div className="text-sm font-extrabold text-forest">PawSure</div>
            <div className="truncate text-[11px] text-muted">{orgName}</div>
          </div>
        </div>
        <nav className="mt-7 flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <span
                key={item.label}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium ${
                  item.active
                    ? "bg-brand-50 text-brand-800"
                    : "text-muted"
                }`}
              >
                <Icon size={18} className={item.active ? "text-brand-600" : "text-muted"} />
                {item.label}
              </span>
            );
          })}
        </nav>
        <p className="mt-auto px-2 text-[10px] text-muted">Demo navigation — not linked</p>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function DemoOwnerHeader() {
  return (
    <header className="border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-5 py-3 lg:px-10">
        <Link href="/demo/dashboard/owner" className="flex items-center gap-2.5">
          <PawSureMarkTile className="h-9 w-9" />
          <div>
            <div className="text-sm font-extrabold text-forest">PawSure</div>
            <div className="text-[11px] text-muted">Owner workspace</div>
          </div>
        </Link>
        <div className="ml-auto flex gap-2 text-xs font-medium text-muted">
          <span className="rounded-lg border border-border px-2.5 py-1.5">Account</span>
          <span className="rounded-lg border border-border px-2.5 py-1.5">Sign out</span>
        </div>
      </div>
    </header>
  );
}
