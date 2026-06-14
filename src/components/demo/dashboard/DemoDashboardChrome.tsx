"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DASHBOARD_DEMO_VARIANTS } from "./mock-data";

type Slug = (typeof DASHBOARD_DEMO_VARIANTS)[number]["slug"];

export function DemoDashboardChrome({ active }: { active: Slug }) {
  return (
    <div className="sticky top-0 z-50 border-b border-border/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 px-4 py-2.5 lg:px-8">
        <Link
          href="/demo/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-forest hover:bg-brand-50"
        >
          <ArrowLeft size={14} /> Dashboard demos
        </Link>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <div className="flex flex-wrap gap-1">
          {DASHBOARD_DEMO_VARIANTS.map((v) => (
            <Link
              key={v.slug}
              href={`/demo/dashboard/${v.slug}`}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                active === v.slug
                  ? "bg-brand-600 text-white shadow-ps-button"
                  : "text-muted hover:bg-brand-50 hover:text-forest"
              }`}
            >
              {v.name}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="rounded-full bg-gold/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-forest">
            Preview
          </span>
          <Link
            href={active === "owner" ? "/me" : "/app"}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-forest"
          >
            Live dashboard <ExternalLink size={12} />
          </Link>
        </div>
      </div>
      <p className="border-t border-border/50 bg-brand-50/40 px-4 py-1.5 text-center text-[11px] text-muted lg:px-8">
        <strong className="font-semibold text-forest">Full-width canvas</strong> — production owner
        uses <code className="text-forest/80">max-w-3xl</code>; these demos show how wider layouts
        feel on desktop
      </p>
    </div>
  );
}
