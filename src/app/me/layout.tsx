import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, UserCircle } from "lucide-react";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { getCurrentUser } from "@/lib/auth";
import { needsEmailVerification } from "@/lib/email-verify";
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
  if (needsEmailVerification(user)) redirect("/verify-email");
  const { t } = await getI18n();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3 md:px-8">
          <Link href="/me" className="flex min-w-0 items-center gap-2.5">
            <PawSureMarkTile className="h-9 w-9 shrink-0" />
            <div className="min-w-0 leading-tight">
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-forest">PawSure</span>
                <span className="font-cn text-xs font-bold text-forest/70">宠诺</span>
              </div>
              <div className="hidden truncate text-[11px] text-muted sm:block">
                {t.me.headerTagline}
              </div>
            </div>
          </Link>
          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LocaleToggle compact />
            <Link
              href="/me/account"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              <UserCircle size={13} /> {t.account.nav}
            </Link>
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
      <main className="mx-auto min-w-0 max-w-3xl overflow-x-hidden px-5 py-8 md:px-8">
        {children}
      </main>
    </div>
  );
}
