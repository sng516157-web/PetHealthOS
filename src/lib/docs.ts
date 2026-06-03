import { promises as fs } from "fs";
import path from "path";

// Reads markdown files from the repo's /docs directory at request time. Surfaced
// in the admin area (read-only). On Vercel the files are bundled into the /admin
// function via `outputFileTracingIncludes` in next.config.ts.

const DOCS_DIR = path.join(process.cwd(), "docs");

export type DocFile = { name: string; content: string };

// The updates log / changelog — pinned to the top of the docs list.
export const UPDATES_FILE = "UPDATES.md";

async function listDocNames(): Promise<string[]> {
  try {
    const entries = await fs.readdir(DOCS_DIR);
    const md = entries.filter((f) => f.toLowerCase().endsWith(".md"));
    md.sort((a, b) => {
      if (a === UPDATES_FILE) return -1;
      if (b === UPDATES_FILE) return 1;
      return a.localeCompare(b);
    });
    return md;
  } catch {
    return [];
  }
}

export async function readAllDocs(): Promise<DocFile[]> {
  const names = await listDocNames();
  return Promise.all(
    names.map(async (name) => ({
      name,
      content: await fs.readFile(path.join(DOCS_DIR, name), "utf8"),
    })),
  );
}
