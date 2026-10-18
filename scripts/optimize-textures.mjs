/**
 * Prepares the museum's material textures from ambientCG packs (CC0 1.0,
 * https://ambientcg.com): keeps only the colour, OpenGL normal and roughness
 * maps the scene uses, resizes them and writes WebP to public/textures/.
 *
 * Usage: node scripts/optimize-textures.mjs <folder containing the extracted 1K-JPG packs>
 *   e.g. <folder>/Marble014/Marble014_1K-JPG_Color.jpg
 *
 * The packs themselves are not kept in the repository.
 */
import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const OUT_DIR = path.resolve("public/textures");

/** Source pack, output name, and the size (px) of each map kept. */
const MATERIALS = [
  // Pale floor marble: warm ivory ground with soft natural veining.
  { id: "Marble014", name: "marble-ivory", maps: { color: 1024, roughness: 512 } },
  // Dark border marble: near-black with fine white veins.
  { id: "Marble016", name: "marble-nero", maps: { color: 1024, roughness: 512 } },
  // Walnut for the doors, frames and furniture.
  { id: "Wood051", name: "walnut", maps: { color: 1024, normal: 1024, roughness: 512 } },
  // Fine plaster, used for the honed limestone. Its colour clouding is halved so the walls read as even stone,
  // not as stained render; the normal map carries the surface detail.
  { id: "Plaster001", name: "limestone", maps: { color: 1024, normal: 1024 }, colourContrast: 0.5 },
];

const SOURCE_SUFFIX = { color: "Color", normal: "NormalGL", roughness: "Roughness" };

async function writeMap(source, target, size, kind, contrast) {
  let image = sharp(source).resize(size, size, { fit: "fill" });
  if (kind === "roughness") image = image.greyscale();
  if (kind === "color" && contrast !== undefined) {
    // Pull every channel toward its own mean: out = mean + (in - mean) * contrast.
    const { channels } = await sharp(source).stats();
    const slopes = channels.slice(0, 3).map(() => contrast);
    const offsets = channels.slice(0, 3).map((c) => c.mean * (1 - contrast));
    image = image.linear(slopes, offsets);
  }
  // Normal maps need more precision than colour to avoid visible block artefacts.
  const quality = kind === "normal" ? 92 : kind === "roughness" ? 85 : 84;
  await image.webp({ quality, effort: 6 }).toFile(target);
  return (await stat(target)).size;
}

async function main() {
  const sourceDir = process.argv[2];
  if (!sourceDir) throw new Error("Usage: node scripts/optimize-textures.mjs <folder with extracted ambientCG packs>");
  await mkdir(OUT_DIR, { recursive: true });
  let total = 0;
  for (const material of MATERIALS) {
    for (const [kind, size] of Object.entries(material.maps)) {
      const source = path.join(sourceDir, material.id, `${material.id}_1K-JPG_${SOURCE_SUFFIX[kind]}.jpg`);
      const target = path.join(OUT_DIR, `${material.name}-${kind}.webp`);
      const bytes = await writeMap(source, target, size, kind, material.colourContrast);
      total += bytes;
      console.log(`${path.relative(process.cwd(), target)}  ${size}px  ${(bytes / 1024).toFixed(0)} KB`);
    }
  }
  console.log(`total ${(total / 1024).toFixed(0)} KB`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
