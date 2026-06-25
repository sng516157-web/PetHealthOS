import { readFile } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
  csv: "text/csv",
};

/** Stream a private upload ref (blob:, bloburl:, local:) for admin-gated routes. */
export async function streamPrivateDocRef(ref: string): Promise<Response> {
  const idx = ref.indexOf(":");
  const kind = idx === -1 ? "" : ref.slice(0, idx);
  const rest = idx === -1 ? "" : ref.slice(idx + 1);
  const ext = (rest.split("?")[0].split(".").pop() || "").toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  if (kind === "blob") {
    const { get } = await import("@vercel/blob");
    const result = await get(rest, { access: "private" });
    if (!result || !result.stream) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(result.stream, {
      headers: { "Content-Type": result.blob.contentType ?? contentType },
    });
  }

  if (kind === "bloburl") {
    const upstream = await fetch(rest);
    if (!upstream.ok || !upstream.body) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(upstream.body, {
      headers: {
        "Content-Type": upstream.headers.get("content-type") ?? contentType,
      },
    });
  }

  if (kind === "local") {
    try {
      const buf = await readFile(path.join(process.cwd(), ".uploads", rest));
      return new Response(new Uint8Array(buf), {
        headers: { "Content-Type": contentType },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  return new Response("Not found", { status: 404 });
}
