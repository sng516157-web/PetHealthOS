"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { messagingDemo } from "@/lib/demo/messaging-copy";

const NAV = [
  { href: "/demo/messaging", label: messagingDemo.nav.overview, exact: true },
  { href: "/demo/messaging/owner", label: messagingDemo.nav.owner },
  { href: "/demo/messaging/shop", label: messagingDemo.nav.shop },
  { href: "/demo/messaging/facility", label: messagingDemo.nav.facility },
] as const;

export function MessagingDemoChrome({
  active,
}: {
  active: "/demo/messaging" | "/demo/messaging/owner" | "/demo/messaging/shop" | "/demo/messaging/facility";
}) {
  return (
    <div className="sticky top-0 z-50 border-b border-amber-200/80 bg-amber-50/95 backdrop-blur-md">
      <div className="border-b border-amber-200/60 bg-amber-100/80 px-4 py-1.5 text-center text-[11px] font-medium text-amber-950">
        {messagingDemo.banner}
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-2.5 md:px-8">
        <Link
          href="/demo"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-forest hover:bg-white/80"
        >
          <ArrowLeft size={14} /> All demos
        </Link>
        <span className="hidden h-4 w-px bg-amber-200 sm:block" />
        <div className="flex flex-wrap gap-1">
          {NAV.map((item) => {
            const isActive = active === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  isActive
                    ? "bg-brand-600 text-white shadow-ps-button"
                    : "text-forest/70 hover:bg-white/80 hover:text-forest"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/"
          className="ml-auto inline-flex items-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1 text-xs font-semibold text-muted hover:text-forest"
        >
          {messagingDemo.nav.production} <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
