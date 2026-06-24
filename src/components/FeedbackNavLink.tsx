import Link from "next/link";
import { FEEDBACK_PATH } from "@/lib/feedback";

const linkCls =
  "rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-forest";

export function FeedbackNavLink({ label }: { label: string }) {
  return (
    <Link href={FEEDBACK_PATH} className={linkCls}>
      {label}
    </Link>
  );
}
