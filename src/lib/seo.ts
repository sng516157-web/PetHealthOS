import type { Metadata } from "next";
import { canonicalAppUrl, DEFAULT_PUBLIC_APP_URL } from "./site-url";

/** Canonical public origin for metadata, sitemap, and OG URLs. */
export function siteUrl(): string {
  const fromEnv = canonicalAppUrl();
  if (fromEnv) return fromEnv;
  const pub = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (pub) return pub;
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:3000";
}

const DEFAULT_OG = "/apple-icon.png";

export const defaultSiteMetadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "PawSure — Lifelong Pet Health Passports",
    template: "%s · PawSure",
  },
  description:
    "Trusted digital health passports for breeders, pet shops, hospitals, and owners. Tamper-evident records, AI-assisted logs, and seamless handoff when pets go to new homes.",
  keywords: [
    "pet health records",
    "pet health passport",
    "breeder software",
    "pet shop software",
    "veterinary boarding records",
    "digital pet medical records",
  ],
  openGraph: {
    type: "website",
    siteName: "PawSure",
    locale: "en_US",
    images: [{ url: DEFAULT_OG, width: 512, height: 512, alt: "PawSure" }],
  },
  twitter: {
    card: "summary",
    images: [DEFAULT_OG],
  },
  alternates: {
    canonical: "/",
  },
};

export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = opts.path.startsWith("/") ? opts.path : `/${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
    },
  };
}

/** App / auth / private surfaces — keep out of Google index. */
export const privateRobots: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

/** Marketing URLs we want indexed (used by sitemap). */
export const INDEXABLE_PATHS = [
  "/",
  "/owner",
  "/shop",
  "/facility",
  "/pricing",
  "/terms",
  "/privacy",
  "/disclaimer",
] as const;

export { DEFAULT_PUBLIC_APP_URL };
