#!/usr/bin/env node
/** Resize transparent mark + composite cream squircle app icons. */
import fs from "fs";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brand = path.join(root, "public", "brand");
const app = path.join(root, "src", "app");
const src = path.join(brand, "pawsure-mark-1024.png");

const TILE = "#FAF3EB";

async function trimmedMark() {
  return await sharp(src)
    .trim()
    .resize(1024, 1024, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } });
}

async function writeTransparent(size, out) {
  await (await trimmedMark()).resize(size, size).png().toFile(out);
  console.log("wrote", out);
}

async function squircleMask(size) {
  const r = Math.round(size * 0.22);
  const svg = `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" fill="white"/></svg>`;
  return Buffer.from(svg);
}

async function writeAppIcon(size, out) {
  const mark = await (await trimmedMark())
    .resize(Math.round(size * 0.78), Math.round(size * 0.78))
    .png()
    .toBuffer();
  const markMeta = await sharp(mark).metadata();
  const left = Math.round((size - markMeta.width) / 2);
  const top = Math.round((size - markMeta.height) / 2);

  const bg = await sharp({
    create: { width: size, height: size, channels: 4, background: TILE },
  })
    .png()
    .composite([{ input: await squircleMask(size), blend: "dest-in" }])
    .toBuffer();

  await sharp(bg)
    .composite([{ input: mark, left, top }])
    .png()
    .toFile(out);
  console.log("wrote", out);
}

{
  const normalized = path.join(brand, "pawsure-mark-1024.normalized.png");
  await writeTransparent(1024, normalized);
  fs.renameSync(normalized, src);
}
for (const s of [32, 180, 192, 512]) {
  await writeTransparent(s, path.join(brand, `pawsure-mark-${s}.png`));
}

await writeAppIcon(1024, path.join(brand, "app-icon-1024.png"));
for (const s of [32, 180, 192, 512]) {
  await writeAppIcon(s, path.join(brand, `app-icon-${s}.png`));
}
await writeAppIcon(32, path.join(app, "icon.png"));
await writeAppIcon(180, path.join(app, "apple-icon.png"));
