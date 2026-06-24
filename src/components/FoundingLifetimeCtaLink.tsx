"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { trackFoundingLifetimeCtaClicked } from "@/lib/analytics";
import { setFoundingIntentClient } from "@/lib/founding-intent";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function FoundingLifetimeCtaLink({ href, className, children }: Props) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        setFoundingIntentClient();
        trackFoundingLifetimeCtaClicked("homepage");
      }}
    >
      {children}
    </Link>
  );
}
