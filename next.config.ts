import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    },
  },
};

export default nextConfig;
