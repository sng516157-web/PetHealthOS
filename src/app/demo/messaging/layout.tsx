import type { Metadata } from "next";
import Link from "next/link";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { LocaleToggle } from "@/components/LocaleToggle";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = {
  ...privateRobots,
  title: "Messaging preview · PawSure",
};

export default function MessagingDemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-paper/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-3 md:px-8">
          <Link href="/demo/messaging" className="flex items-center gap-2.5">
            <PawSureMarkTile className="h-9 w-9" />
            <span className="text-sm font-extrabold text-forest">PawSure</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            <Link
              href="/pricing"
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-forest sm:inline-flex"
            >
              Pricing
            </Link>
            <LocaleToggle compact />
            <Link
              href="/login"
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-brand-300 hover:text-brand-700"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
