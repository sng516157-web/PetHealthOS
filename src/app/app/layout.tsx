import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Clock, LogOut } from "lucide-react";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { LocaleToggle } from "@/components/LocaleToggle";
import { WorkspaceMotionShell } from "@/components/dashboard/DashboardMotion";
import { signOut } from "@/app/actions";
import { requireActiveOrg, getOrgUnreadCount } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { needsEmailVerification } from "@/lib/email-verify";
import { getI18n } from "@/lib/i18n/server";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = privateRobots;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user && needsEmailVerification(user)) redirect("/verify-email");

  // Gate the whole shop workspace: requireActiveOrg() redirects anyone who is
  // not signed in to a shop account (owners / logged-out) to the /shop landing.
  const org = await requireActiveOrg();

  // KYC gate: a shop must submit its business licence / proof before entering
  // the workspace. Pending & approved shops are allowed in (passport issuance
  // stays locked until approved — enforced in createTransfer).
  if (
    org.verificationStatus === "UNVERIFIED" ||
    org.verificationStatus === "REJECTED"
  ) {
    redirect("/verify");
  }

  const [unread, { t }] = await Promise.all([getOrgUnreadCount(), getI18n()]);
  const pendingReview = org.verificationStatus === "PENDING";

  return (
    <div className="flex min-h-screen w-full min-w-0 max-w-full">
      <Sidebar unread={unread} />
      <main className="min-w-0 flex-1 overflow-x-clip pb-20 md:pb-0">
        {/* Mobile-only top bar: the sidebar (with sign-out) is hidden on mobile. */}
        <header className="sticky top-0 z-30 flex min-w-0 items-center gap-2 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur sm:gap-3 sm:px-5 md:hidden">
          <Link href="/app/account" className="flex min-w-0 flex-1 items-center gap-2">
            <PawSureMarkTile className="h-8 w-8 shrink-0" />
            <span className="truncate text-sm font-extrabold text-forest">
              {org.name}
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <LocaleToggle compact />
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
        </header>
        {pendingReview && (
          <Link
            href="/verify"
            className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100 sm:items-center sm:px-5"
          >
            <Clock size={14} className="mt-0.5 shrink-0 sm:mt-0" />
            <span className="min-w-0 leading-snug">
              {t.verify.pendingTitle} — {t.verify.pendingDesc}
            </span>
          </Link>
        )}
        <WorkspaceMotionShell>
          <div className="w-full min-w-0 max-w-full px-4 sm:px-5 md:px-8 lg:px-10">{children}</div>
        </WorkspaceMotionShell>
      </main>
      <MobileNav unread={unread} />
    </div>
  );
}
