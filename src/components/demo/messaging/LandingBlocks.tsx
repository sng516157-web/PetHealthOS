import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motionCardHover } from "@/components/motion/aurora";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{eyebrow}</span>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-forest md:text-3xl">{title}</h2>
      {subtitle && (
        <p
          className={`mt-2 max-w-xl text-sm text-ink/65 ${align === "center" ? "mx-auto" : ""}`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function PathCard({
  href,
  icon,
  title,
  desc,
  cta,
  highlight,
  demoHref,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  cta: string;
  highlight?: boolean;
  demoHref?: string;
}) {
  const target = demoHref ?? href;
  return (
    <Link
      href={target}
      className={`group flex h-full flex-col rounded-3xl border p-7 shadow-soft transition hover:-translate-y-0.5 ${motionCardHover} ${
        highlight ? "border-brand-300 bg-brand-50/40" : "border-border bg-surface"
      }`}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
        {icon}
      </span>
      <h3 className="mt-5 text-xl font-extrabold text-forest">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/70">{desc}</p>
      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700">
        {cta} <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function BulletList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-ink/75">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function StepGrid({
  steps,
}: {
  steps: readonly { title: string; desc: string }[];
}) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {steps.map((s, i) => (
        <div
          key={s.title}
          className={`rounded-3xl border border-border bg-surface p-6 shadow-soft ${motionCardHover}`}
        >
          <span className="text-3xl font-extrabold text-brand-100">{i + 1}</span>
          <h3 className="mt-2 text-lg font-bold text-forest">{s.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">{s.desc}</p>
        </div>
      ))}
    </div>
  );
}

export function PricingPreview({
  eyebrow,
  title,
  desc,
  cta,
  href,
}: {
  eyebrow: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="rounded-3xl border border-brand-200 bg-brand-50/40 p-6 shadow-soft md:p-8">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sage">{eyebrow}</span>
      <h3 className="mt-2 text-xl font-extrabold text-forest">{title}</h3>
      <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink/70">{desc}</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={href}
          className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-ps-button transition hover:bg-brand-700"
        >
          {cta} <ArrowRight size={15} />
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-white px-5 py-2.5 text-sm font-semibold text-forest transition hover:border-brand-300"
        >
          See full pricing
        </Link>
      </div>
    </div>
  );
}
