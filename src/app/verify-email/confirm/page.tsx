import { redirect } from "next/navigation";
import { confirmEmailVerification } from "@/lib/email-verify";
import { setSession } from "@/lib/auth";

export default async function VerifyEmailConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  if (!token) redirect("/verify-email?error=TOKEN_MISSING");

  const res = await confirmEmailVerification(token);
  if ("error" in res) redirect(`/verify-email?error=${res.error}`);

  await setSession(res.userId, { single: res.accountType === "owner" });
  redirect(res.accountType === "owner" ? "/me" : "/app");
}
