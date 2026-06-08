import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { getI18n } from "@/lib/i18n/server";
import { getDisclaimer } from "@/lib/legal";
import { LandingHeader, LandingFooter } from "@/components/LandingHeader";

export const metadata: Metadata = {
  title: "免责声明 · Disclaimer — PawSure 宠诺",
};

export default async function DisclaimerPage() {
  const { t, locale } = await getI18n();
  const d = getDisclaimer(locale);

  return (
    <div className="min-h-screen bg-paper">
      <LandingHeader t={t} />

      <main className="mx-auto max-w-3xl px-5 py-12 md:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-forest"
        >
          <ArrowLeft size={14} /> {t.landing.backHome}
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <ShieldAlert size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-forest">{d.title}</h1>
            <p className="text-xs text-muted">{d.updatedLabel}</p>
          </div>
        </div>

        <article className="mt-8 space-y-7">
          <p className="text-sm leading-relaxed text-ink/80">{d.intro}</p>

          {d.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-base font-bold text-forest">{s.heading}</h2>
              <div className="mt-2 space-y-2">
                {s.body.map((p, i) => (
                  <p key={i} className="text-sm leading-relaxed text-ink/75">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section>
            <h2 className="text-base font-bold text-forest">{d.contactHeading}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{d.contactBody}</p>
          </section>
        </article>
      </main>

      <LandingFooter t={t} />
    </div>
  );
}
