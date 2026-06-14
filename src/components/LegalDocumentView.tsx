import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { LegalDocument } from "@/lib/legal";
import { AuroraOrbs, MotionPop, MotionReveal } from "@/components/motion/aurora";

export function LegalDocumentView({
  doc,
  backLabel,
  icon: Icon,
}: {
  doc: LegalDocument;
  backLabel: ReactNode;
  icon: LucideIcon;
}) {
  return (
    <main className="relative overflow-hidden">
      <AuroraOrbs subtle className="-z-10 opacity-60" />
      <div className="relative mx-auto max-w-3xl px-5 py-12 md:px-8">
        <MotionPop index={0}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest"
          >
            {backLabel}
          </Link>
        </MotionPop>

        <MotionPop index={1}>
          <div className="mt-6 flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Icon size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-forest">{doc.title}</h1>
              <p className="text-xs text-muted">{doc.updatedLabel}</p>
            </div>
          </div>
        </MotionPop>

        <article className="mt-8 space-y-7">
          <MotionReveal delay={80}>
            <p className="text-sm leading-relaxed text-ink/80">{doc.intro}</p>
          </MotionReveal>

          {doc.sections.map((s, i) => (
            <MotionReveal key={s.heading} delay={120 + i * 40}>
              <section>
                <h2 className="text-base font-bold text-forest">{s.heading}</h2>
                <div className="mt-2 space-y-2">
                  {s.body.map((p, j) => (
                    <p key={j} className="text-sm leading-relaxed text-ink/75">
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            </MotionReveal>
          ))}

          <MotionReveal delay={120 + doc.sections.length * 40}>
            <section>
              <h2 className="text-base font-bold text-forest">{doc.contactHeading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{doc.contactBody}</p>
            </section>
          </MotionReveal>
        </article>
      </div>
    </main>
  );
}
