import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartPulse, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/app/actions";
import { LocaleToggle } from "@/components/LocaleToggle";
import { getI18n } from "@/lib/i18n/server";

export default async function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { t } = await getI18n();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3 md:px-8">
          <Link href="/me" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm">
              <HeartPulse size={17} />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-foreground">
                {t.common.appName}
              </div>
              <div className="text-[11px] text-muted">{t.me.headerTagline}</div>
            </div>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LocaleToggle compact />
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
              >
                <LogOut size={13} /> {t.auth.signOut}
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
