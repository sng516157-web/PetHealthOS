// Vercel Blob public URLs (`*.blob.vercel-storage.com`) are GFW-blocked, so pet
// photos / log media break in mainland China even when the app itself is
// reachable through the Hong Kong proxy. Route those images through our own
// same-origin `/api/img` proxy: the browser only ever talks to the reachable
// proxy domain, and the (blocked) blob host is fetched server-side from Vercel.
//
// Isomorphic: safe to call from both Server and Client Components. Only blob
// public URLs are rewritten — local dev uploads (`/uploads/...`), data: URIs
// (QR codes), and FileReader previews (`blob:`) are returned untouched.
//
// Escape hatch: set NEXT_PUBLIC_IMG_PROXY=0 to disable and serve blob URLs
// directly (e.g. if a CDN later fronts the blob store).

const BLOB_HOST = ".blob.vercel-storage.com";

export function proxyImageSrc<T extends string | null | undefined>(url: T): T {
  if (!url || typeof url !== "string") return url;
  if (process.env.NEXT_PUBLIC_IMG_PROXY === "0") return url;
  if (!url.includes(BLOB_HOST)) return url;
  return (`/api/img?u=${encodeURIComponent(url)}`) as T;
}
