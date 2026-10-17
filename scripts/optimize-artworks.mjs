/**
 * Builds web display copies of the original painting photographs.
 *
 *   source:  public/artworks/paintings/<id>.(jpg|jpeg|png)   (untouched originals)
 *   output:  public/artworks/display/<id>-2048.webp          (desktop texture + collection)
 *            public/artworks/display/<id>-1024.webp          (phones and tablets)
 *            src/content/artwork-images.generated.json       (paths and pixel sizes)
 *
 * Images are only resized and re-encoded: no cropping, colour grading or
 * sharpening. Embedded colour profiles are converted to sRGB so browsers show
 * the photographed colours as intended. Run with `npm run artworks`.
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const SOURCE_DIR = path.join(ROOT, "public/artworks/paintings");
const OUTPUT_DIR = path.join(ROOT, "public/artworks/display");
const MANIFEST = path.join(ROOT, "src/content/artwork-images.generated.json");
const SIZES = [2048, 1024];
const EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

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

  for (const size of SIZES) {
    const output = path.join(OUTPUT_DIR, `${id}-${size}.webp`);
    const info = await sharp(input)
      .rotate() // honour EXIF orientation
      .resize({ width: size, height: size, fit: "inside", withoutEnlargement: true })
      .toColorspace("srgb")
      .webp({ quality: 90, smartSubsample: true, effort: 6 })
      .toFile(output);
    const publicPath = `/artworks/display/${id}-${size}.webp`;
    if (size === SIZES[0]) Object.assign(entry, { src: publicPath, width: info.width, height: info.height });
    else entry.srcSmall = publicPath;
    console.log(`${file} -> ${path.relative(ROOT, output)} (${info.width}x${info.height}, ${Math.round(info.size / 1024)} KB)`);
  }
  manifest[id] = entry;
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Wrote ${path.relative(ROOT, MANIFEST)}`);
