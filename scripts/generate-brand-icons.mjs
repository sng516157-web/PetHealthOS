#!/usr/bin/env node
/** One-shot: resize master app icon into favicon / brand PNG sizes. */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brand = path.join(root, "public", "brand");
const app = path.join(root, "src", "app");
const src = path.join(brand, "app-icon-1024.png");

async function resize(size, out) {
  await sharp(src).resize(size, size).png().toFile(out);
  console.log("wrote", out);
}

await resize(1024, path.join(brand, "app-icon-1024.png"));
for (const s of [32, 180, 192, 512]) {
  await resize(s, path.join(brand, `app-icon-${s}.png`));
}
await resize(32, path.join(app, "icon.png"));
await resize(180, path.join(app, "apple-icon.png"));
