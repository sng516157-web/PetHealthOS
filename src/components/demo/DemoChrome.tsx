"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DEMO_VARIANTS, type DemoVariantSlug } from "./content";

export function DemoChrome({
  active,
  label,
}: {
  active?: DemoVariantSlug;
  label: string;
}) {
  return (
    <div className="sticky top-0 z-50 border-b border-border/80 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-2.5 md:px-8">
        <Link
          href="/demo"
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-forest hover:bg-brand-50"
        >
          <ArrowLeft size={14} /> All demos
        </Link>
        <span className="hidden h-4 w-px bg-border sm:block" />
        <div className="flex flex-wrap gap-1">
          {DEMO_VARIANTS.map((v) => (
            <Link
              key={v.slug}
              href={`/demo/${v.slug}`}
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
            href="/"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted hover:text-forest"
          >
            Live site <ExternalLink size={12} />
          </Link>
        </div>
      </div>
      <p className="border-t border-border/50 bg-brand-50/40 px-4 py-1.5 text-center text-[11px] text-muted md:px-8">
        <strong className="font-semibold text-forest">{label}</strong> — localhost preview only, not indexed or deployed
      </p>
    </div>
  );
}
