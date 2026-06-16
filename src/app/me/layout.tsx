import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { getCurrentUser } from "@/lib/auth";
import { needsEmailVerification } from "@/lib/email-verify";
import { signOut } from "@/app/actions";
import { LocaleToggle } from "@/components/LocaleToggle";
import { WorkspaceMotionShell } from "@/components/dashboard/DashboardMotion";
import { getI18n } from "@/lib/i18n/server";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = privateRobots;

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (needsEmailVerification(user)) redirect("/verify-email");
  const { t } = await getI18n();

  return (
    <div className="min-h-screen min-w-0 overflow-x-hidden">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex min-w-0 max-w-[1600px] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-5 md:px-8 lg:px-10">
          <Link href="/me" className="flex min-w-0 flex-1 items-center gap-2.5">
            <PawSureMarkTile className="h-9 w-9 shrink-0" />
            <div className="min-w-0 leading-tight">
              <div className="flex min-w-0 items-baseline gap-1.5">
                <span className="truncate text-sm font-extrabold text-forest">PawSure</span>
                <span className="shrink-0 font-cn text-xs font-bold text-forest/70">宠诺</span>
              </div>
              <div className="hidden truncate text-[11px] text-muted sm:block">
                {t.me.headerTagline}
              </div>
            </div>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LocaleToggle compact />
            <Link
              href="/me/account"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700 sm:px-2.5"
              aria-label={t.account.nav}
            >
              <UserCircle size={13} /> <span className="hidden sm:inline">{t.account.nav}</span>
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-300 hover:text-rose-600 sm:px-2.5"
                aria-label={t.auth.signOut}
              >
                <LogOut size={13} /> <span className="hidden sm:inline">{t.auth.signOut}</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto min-w-0 max-w-[1600px] overflow-x-hidden px-5 md:px-8 lg:px-10">
        <WorkspaceMotionShell>{children}</WorkspaceMotionShell>
      </main>
    </div>
  );
}
