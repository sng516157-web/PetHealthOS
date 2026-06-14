import type { NextConfig } from "next";

// The app is reachable from mainland China through a Hong Kong reverse proxy
// (Caddy) that forwards to Vercel. The browser's Origin is then the proxy
// domain (e.g. https://pethealthos.online) while Vercel sees its own host, so
// Server Actions would be rejected as cross-origin. Whitelist the proxy
// domain(s) here. Extra hosts can be added via PROXY_ALLOWED_ORIGINS
// (comma-separated, host only) without a code change — handy if the brand /
// domain changes. List host names WITHOUT the scheme.
const allowedOrigins = [
  "pethealthos.online",
  "www.pethealthos.online",
  ...(process.env.PROXY_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean),
];

const nextConfig: NextConfig = {
  // Next.js 15.2+ streams metadata after the HTML shell. Google Search Console can
  // report "User-declared canonical: None" when the <link rel="canonical"> arrives
  // late. Disable streaming so title, description, and canonical are always in <head>.
  htmlLimitedBots: /.*/,
  // The /admin page reads the repo's /docs markdown at request time. Bundle those
  // files into the admin function so they exist on Vercel (the filesystem there
  // only contains traced files).
  outputFileTracingIncludes: {
    "/admin": ["./docs/**/*.md"],
  },
  experimental: {
    // Pet photos / verification docs are submitted through Server Actions (form
    // posts), so the request body can be several MB. The default cap is 1 MB,
    // which crashes the action ("Body exceeded 1 MB limit"). saveUpload accepts
    // images up to 8 MB, so allow comfortably above that.
    serverActions: {
      bodySizeLimit: "12mb",
      allowedOrigins,
    },
  },
};

export default nextConfig;
