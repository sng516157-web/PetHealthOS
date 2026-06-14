import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PawSureMarkTile } from "@/components/PawSureLogo";
import { getCurrentUser } from "@/lib/auth";
import { AuthCard } from "@/components/AuthCard";
import { LocaleToggle } from "@/components/LocaleToggle";
import { getI18n } from "@/lib/i18n/server";
import { AuroraOrbs, MotionPop } from "@/components/motion/aurora";
import { privateRobots } from "@/lib/seo";

export const metadata: Metadata = privateRobots;

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.orgId ? "/app" : "/me");
  const { locale, t } = await getI18n();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-10">
      <AuroraOrbs subtle className="-z-10 opacity-80" />
      <div className="relative w-full max-w-sm">
        <MotionPop index={0}>
          <div className="mb-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <PawSureMarkTile className="h-9 w-9" />
              <span className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold text-forest">PawSure</span>
                {locale === "zh" && (
                  <span className="font-cn text-xs font-bold text-forest/70">宠诺</span>
                )}
              </span>
            </Link>
            <LocaleToggle compact />
          </div>
        </MotionPop>

        <MotionPop index={1}>
          <AuthCard />
        </MotionPop>
      </div>
    </div>
  );
}
