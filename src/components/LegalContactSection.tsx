import Link from "next/link";
import type { LegalDocument } from "@/lib/legal";
import { FEEDBACK_PATH } from "@/lib/feedback";

export function LegalContactSection({ doc }: { doc: LegalDocument }) {
  return (
    <section>
      <h2 className="text-base font-bold text-forest">{doc.contactHeading}</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/75">{doc.contactBody}</p>
      <Link
        href={FEEDBACK_PATH}
        className="mt-3 inline-flex items-center rounded-xl border border-brand-300 bg-brand-50/60 px-4 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-400 hover:bg-brand-50"
      >
        {doc.contactLinkLabel}
      </Link>
    </section>
  );
}
