import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import { Sidebar, MobileNav } from "@/components/Sidebar";
import { requireActiveOrg, getOrgUnreadCount } from "@/lib/data";
import { getI18n } from "@/lib/i18n/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="flex min-h-screen">
      <Sidebar orgName={org.name} unread={unread} />
      <main className="flex-1 pb-20 md:pb-0">
        {pendingReview && (
          <Link
            href="/verify"
            className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-2.5 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
          >
            <Clock size={14} className="shrink-0" />
            {t.verify.pendingTitle} — {t.verify.pendingDesc}
          </Link>
        )}
        {children}
      </main>
      <MobileNav unread={unread} />
    </div>
  );
}
