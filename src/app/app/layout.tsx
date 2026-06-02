import { Sidebar, MobileNav } from "@/components/Sidebar";
import { requireActiveOrg, getOrgUnreadCount } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Gate the whole shop workspace: requireActiveOrg() redirects anyone who is
  // not signed in to a shop account (owners / logged-out) to the /shop landing.
  const [org, unread] = await Promise.all([
    requireActiveOrg(),
    getOrgUnreadCount(),
  ]);
  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={org.name} unread={unread} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileNav unread={unread} />
    </div>
  );
}
