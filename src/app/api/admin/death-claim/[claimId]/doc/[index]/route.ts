import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { parseProofDocUrls } from "@/lib/pet-closure-shared";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

async function streamDocRef(ref: string): Promise<Response> {
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ claimId: string; index: string }> },
) {
  if (!(await isAdmin())) return new Response("Forbidden", { status: 403 });

  const { claimId, index: indexRaw } = await params;
  const index = Number.parseInt(indexRaw, 10);
  if (!Number.isFinite(index) || index < 0) {
    return new Response("Bad request", { status: 400 });
  }

  const claim = await prisma.petDeathClaim.findUnique({ where: { id: claimId } });
  if (!claim) return new Response("Not found", { status: 404 });

  const urls = parseProofDocUrls(claim.proofDocUrls);
  const ref = urls[index];
  if (!ref) return new Response("Not found", { status: 404 });

  return streamDocRef(ref);
}
