import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/me/",
        "/me",
        "/app/",
        "/app",
        "/admin",
        "/api/",
        "/passport/",
        "/verify-email",
        "/verify",
        "/forgot-password",
        "/reset-password",
        "/billing/",
        "/brand",
        "/login",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
