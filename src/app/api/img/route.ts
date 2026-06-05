import type { NextRequest } from "next/server";

// Same-origin proxy for Vercel Blob public images. The browser requests
// `/api/img?u=<blob url>` (reachable from mainland China via the HK proxy), and
// we stream the bytes from the blob host server-side (Vercel → blob, not behind
// the GFW). See src/lib/img.ts for the URL rewriting.
//
// SSRF guard: only `https://*.blob.vercel-storage.com` may be fetched.

export const runtime = "nodejs";

const ALLOWED_HOST = /\.blob\.vercel-storage\.com$/i;

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("u");
  if (!raw) return new Response("missing u", { status: 400 });

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return new Response("bad url", { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOST.test(target.hostname)) {
    return new Response("forbidden host", { status: 403 });
  }

  // Forward Range so video seeking works.
  const fwd: HeadersInit = {};
  const range = req.headers.get("range");
  if (range) (fwd as Record<string, string>).range = range;

  let upstream: Response;
  try {
    upstream = await fetch(target.toString(), { headers: fwd, cache: "no-store" });
  } catch {
    return new Response("upstream error", { status: 502 });
  }

  const headers = new Headers();
  for (const h of [
    "content-type",
    "content-length",
    "content-range",
    "accept-ranges",
    "etag",
    "last-modified",
  ]) {
    const v = upstream.headers.get(h);
    if (v) headers.set(h, v);
  }
  // Blob filenames are random + immutable, so cache hard.
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(upstream.body, { status: upstream.status, headers });
}
