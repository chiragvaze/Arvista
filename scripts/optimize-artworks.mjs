/**
 * Builds web display copies of the original painting photographs.
 *
 *   source:  public/artworks/paintings/<id>.(jpg|jpeg|png)   (untouched originals)
 *   output:  public/artworks/display/<id>-2048-<hash>.webp   (desktop texture + collection)
 *            public/artworks/display/<id>-1024-<hash>.webp   (phones and tablets)
 *            src/content/artwork-images.generated.json       (paths, pixel sizes, crops)
 *
 * File names carry a content hash, so a changed image always gets a new URL and
 * no browser, CDN or Next.js image cache can keep serving the old version.
 *
 * Images are only cropped (where listed below), resized and re-encoded: no
 * colour grading, sharpening or upscaling. Embedded colour profiles are
 * converted to sRGB so browsers show the photographed colours as intended.
 * Run with `npm run artworks`.
 */
import { createHash } from "node:crypto";
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_DIR = path.join(ROOT, "public/artworks/paintings");
const OUTPUT_DIR = path.join(ROOT, "public/artworks/display");
const MANIFEST = path.join(ROOT, "src/content/artwork-images.generated.json");
const SIZES = [2048, 1024];
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

/**
 * Display crops that remove unpainted canvas around a painting. These are
 * measured by hand from the photograph and checked visually; they are never
 * detected automatically. Pixel bounds refer to the EXIF-rotated original.
 */
const CROPS = {
  // The photo includes the bare white border of the canvas board. Paint edges measured per row/column:
  // left 70–90, top 78–88, right 1755–1773, bottom 2377–2386 (the photo is rotated by ~0.3°).
  // This is the largest rectangle with no bare canvas. The signature (x ≤ 1745, y ≤ 2370 including its
  // underline) stays inside with 8 px / 5 px to spare; at most ~20 px of plain background paint is trimmed
  // where the slight rotation pushes the painted edge outward.
  "the-silent-ruler": { left: 92, top: 90, width: 1662, height: 2286 },
};

const files = (await readdir(SOURCE_DIR)).filter((f) => EXTENSIONS.has(path.extname(f).toLowerCase())).sort();
if (files.length === 0) {
  console.error(`No painting photographs found in ${path.relative(ROOT, SOURCE_DIR)}`);
  process.exit(1);
}

await mkdir(OUTPUT_DIR, { recursive: true });
const manifest = {};

for (const file of files) {
  const id = path.basename(file, path.extname(file));
  const input = path.join(SOURCE_DIR, file);
  const entry = { original: `/artworks/paintings/${file}` };
  const crop = CROPS[id];
  if (crop) {
    const meta = await sharp(input).rotate().toBuffer({ resolveWithObject: true }).then((r) => r.info);
    if (crop.left + crop.width > meta.width || crop.top + crop.height > meta.height) {
      throw new Error(`Crop for ${id} exceeds the ${meta.width}x${meta.height} photograph`);
    }
    entry.crop = { ...crop, sourceWidth: meta.width, sourceHeight: meta.height };
  }

  for (const size of SIZES) {
    let pipeline = sharp(input).rotate(); // honour EXIF orientation
    if (crop) pipeline = sharp(await pipeline.extract(crop).toBuffer());
    const { data, info } = await pipeline
      .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
      .toColorspace("srgb")
      .webp({ quality: 90, smartSubsample: true, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    const hash = createHash("sha256").update(data).digest("hex").slice(0, 10);
    const name = `${id}-${size}-${hash}.webp`;
    const output = path.join(OUTPUT_DIR, name);
    // Remove earlier versions of this size (older hashes, or the unhashed names of previous builds).
    for (const existing of await readdir(OUTPUT_DIR)) {
      if (existing !== name && (existing === `${id}-${size}.webp` || existing.startsWith(`${id}-${size}-`))) {
        await rm(path.join(OUTPUT_DIR, existing));
      }
    }
    await writeFile(output, data);
    const publicPath = `/artworks/display/${name}`;
    if (size === SIZES[0]) Object.assign(entry, { src: publicPath, width: info.width, height: info.height });
    else entry.srcSmall = publicPath;
    console.log(`${file} -> ${path.relative(ROOT, output)} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
  }
  manifest[id] = entry;
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${path.relative(ROOT, MANIFEST)}`);
