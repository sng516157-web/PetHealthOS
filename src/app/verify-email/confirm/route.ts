import { NextResponse } from "next/server";
import { confirmEmailVerification } from "@/lib/email-verify";
import { setSession } from "@/lib/auth";

function workspacePath(accountType: "owner" | "shop" | "facility"): string {
  return accountType === "owner" ? "/me" : "/app";
}

// Magic-link confirmation must run in a Route Handler so Set-Cookie + redirect
// work reliably. Doing cookies().set() in a Server Component page then
// redirect() often 500s on Vercel (cookie mutation during RSC render).
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token")?.trim();
  if (!token) {
    return NextResponse.redirect(
      new URL("/verify-email?error=TOKEN_MISSING", url.origin),
    );
  }

  const res = await confirmEmailVerification(token);
  if ("error" in res) {
    return NextResponse.redirect(
      new URL(`/verify-email?error=${encodeURIComponent(res.error)}`, url.origin),
    );
  }

  await setSession(res.userId, { single: res.accountType === "owner" });

  const dest = new URL(workspacePath(res.accountType), url.origin);
  dest.searchParams.set("verified", "1");
  dest.searchParams.set("account", res.accountType);
  return NextResponse.redirect(dest);
}
