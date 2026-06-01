import { Sidebar, MobileNav } from "@/components/Sidebar";
import { getActiveOrg, getOrgUnreadCount } from "@/lib/data";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const org = await getActiveOrg();
  const unread = await getOrgUnreadCount();
  return (
    <div className="flex min-h-screen">
      <Sidebar orgName={org.name} unread={unread} />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileNav unread={unread} />
    </div>
  );
}
