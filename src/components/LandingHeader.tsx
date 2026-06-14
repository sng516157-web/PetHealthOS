import Link from "next/link";
import { PawSureMarkTile, PawSureMark } from "@/components/PawSureLogo";
import { LocaleToggle } from "@/components/LocaleToggle";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/en";

export function LandingHeader({ t, locale = "en" }: { t: Dictionary; locale?: Locale }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <PawSureMarkTile className="h-9 w-9" />
          <span className="flex items-baseline gap-1.5">
            <span className="text-sm font-extrabold text-forest">PawSure</span>
            {locale === "zh" && (
              <span className="font-cn text-xs font-bold text-forest/70">宠诺</span>
            )}
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-2">
          <Link
            href="/pricing"
            className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-forest sm:inline-flex"
          >
            {t.landing.nav.pricing}
          </Link>
          <LocaleToggle compact />
          <Link
            href="/login"
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
          >
            {t.landing.nav.signIn}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function LandingFooter({ t, locale = "en" }: { t: Dictionary; locale?: Locale }) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-center md:flex-row md:px-8 md:text-left">
        <div className="flex items-center gap-2.5">
          <PawSureMark className="h-7 w-7" />
          <span className="text-sm font-bold text-forest">
            {locale === "zh" ? "PawSure 宠诺" : "PawSure"}
          </span>
        </div>
        <p className="text-xs text-muted">{t.landing.footerRights}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-medium text-slate-600">
          <Link href="/pricing" className="hover:text-forest">
            {t.landing.nav.pricing}
          </Link>
          <Link href="/terms" className="hover:text-forest">
            {t.landing.termsOfService}
          </Link>
          <Link href="/privacy" className="hover:text-forest">
            {t.landing.privacyPolicy}
          </Link>
          <Link href="/disclaimer" className="hover:text-forest">
            {t.landing.disclaimer}
          </Link>
          <Link href="/login" className="hover:text-forest">
            {t.landing.nav.signIn}
          </Link>
        </div>
      </div>
    </footer>
  );
}
