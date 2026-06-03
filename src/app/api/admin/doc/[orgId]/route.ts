import { readFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  pdf: "application/pdf",
};

// Streams a shop's private verification document to reviewers only. The doc is
// stored as a private Blob (prod) or under .uploads (dev); never publicly served.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  if (!(await isAdmin())) return new Response("Forbidden", { status: 403 });

  const { orgId } = await params;
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const ref = org?.verificationDocUrl;
  if (!ref) return new Response("Not found", { status: 404 });

  const [kind, pathname] = ref.split(":");
  const ext = (pathname?.split(".").pop() || "").toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";

  if (kind === "blob") {
    const { get } = await import("@vercel/blob");
    const result = await get(pathname, { access: "private" });
    if (!result || !result.stream) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(result.stream, {
      headers: { "Content-Type": result.blob.contentType ?? contentType },
    });
  }

  if (kind === "local") {
    try {
      const buf = await readFile(path.join(process.cwd(), ".uploads", pathname));
      return new Response(new Uint8Array(buf), {
        headers: { "Content-Type": contentType },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  return new Response("Not found", { status: 404 });
}
