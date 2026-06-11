import { readFile } from "fs/promises";
import path from "path";

const BLOB_HOST = ".blob.vercel-storage.com";

function guessMimeFromUrl(url: string): string {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0];
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
  };
  return (ext && map[ext]) || "application/octet-stream";
}

/** Read bytes for a stored upload URL (local /uploads or Vercel Blob). */
export async function fetchStoredFileBytes(
  url: string,
): Promise<{ data: Uint8Array; mediaType: string } | null> {
  try {
    if (url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", url);
      const buf = await readFile(filePath);
      return { data: new Uint8Array(buf), mediaType: guessMimeFromUrl(url) };
    }
    if (url.includes(BLOB_HOST) && url.startsWith("https://")) {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      const buf = await res.arrayBuffer();
      const mediaType =
        res.headers.get("content-type")?.split(";")[0]?.trim() ||
        guessMimeFromUrl(url);
      return { data: new Uint8Array(buf), mediaType };
    }
  } catch (e) {
    console.error("fetchStoredFileBytes failed", url, e);
  }
  return null;
}

export function isVisionMime(mime: string | null | undefined): boolean {
  if (!mime) return false;
  return mime.startsWith("image/") || mime === "application/pdf";
}
