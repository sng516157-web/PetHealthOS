import Link from "next/link";
import { redirect } from "next/navigation";
import { HeartPulse } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { SignInForm } from "@/components/SignInForm";
import { LocaleToggle } from "@/components/LocaleToggle";
import { getI18n } from "@/lib/i18n/server";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/me");
  const { t } = await getI18n();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
              <HeartPulse size={20} />
            </div>
            <span className="text-sm font-semibold text-foreground">
              {t.common.appName}
            </span>
          </Link>
          <LocaleToggle compact />
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">
            {t.auth.signInTitle}
          </h1>
          <p className="mt-1 mb-4 text-sm text-muted">{t.auth.signInSubtitle}</p>
          <SignInForm />
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          {t.auth.noAccountHint}
        </p>
      </div>
    </div>
  );
}
