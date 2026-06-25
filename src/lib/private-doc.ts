import { readFile } from "fs/promises";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

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

/** Read private upload bytes (for CSV parse / re-publish as attachment). */
export async function readPrivateDocBytes(ref: string): Promise<Buffer | null> {
  const idx = ref.indexOf(":");
  const kind = idx === -1 ? "" : ref.slice(0, idx);
  const rest = idx === -1 ? "" : ref.slice(idx + 1);

  if (kind === "blob") {
    const { get } = await import("@vercel/blob");
    const result = await get(rest, { access: "private" });
    if (!result?.stream) return null;
    const ab = await new Response(result.stream).arrayBuffer();
    return Buffer.from(ab);
  }

  if (kind === "bloburl") {
    const upstream = await fetch(rest);
    if (!upstream.ok) return null;
    return Buffer.from(await upstream.arrayBuffer());
  }

  if (kind === "local") {
    try {
      return await readFile(path.join(process.cwd(), ".uploads", rest));
    } catch {
      return null;
    }
  }

  return null;
}

function extFromName(name: string): string {
  return (name.split(".").pop() || "bin").toLowerCase().slice(0, 8);
}

/** Copy a private import file to a public upload URL (attachments). */
export async function publishPrivateDocBytes(
  ref: string,
  fileName: string,
): Promise<{ url: string; mimeType: string } | null> {
  const bytes = await readPrivateDocBytes(ref);
  if (!bytes) return null;

  const ext = extFromName(fileName);
  const mimeType = MIME[ext] ?? "application/octet-stream";
  const outName = `${randomBytes(8).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`uploads/${outName}`, bytes, {
      access: "public",
      contentType: mimeType,
    });
    return { url: blob.url, mimeType };
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, outName), bytes);
  return { url: `/uploads/${outName}`, mimeType };
}
