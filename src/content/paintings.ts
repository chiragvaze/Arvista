import type { ArtworkImage, Painting } from "@/types/artwork";
import generatedImages from "./artwork-images.generated.json";

type GeneratedImage = Omit<ArtworkImage, "alt">;
const images: Record<string, GeneratedImage> = generatedImages;

/**
 * Display image for a painting, produced by `npm run artworks` from the
 * photograph in public/artworks/paintings/<id>.jpeg. Fails loudly if the photo
 * has not been processed, rather than showing the wrong image.
 */
function displayImage(id: string, alt: string): ArtworkImage {
  const image = images[id];
  if (!image) {
    throw new Error(
      `No display image for "${id}". Add public/artworks/paintings/${id}.jpeg and run \`npm run artworks\`.`,
    );
  }
  return { ...image, alt };
}

/**
 * Paintings in the gallery. Order sets the hanging sequence along the corridor;
 * walls alternate left/right unless `wall` is given.
 */
export const paintings: Painting[] = [
  {
    id: "the-silent-ruler",
    title: "The Silent Ruler",
    image: displayImage(
      "the-silent-ruler",
      "Painting of a bald eagle in profile, its white head and amber eye turned to the right, against a sweeping purple and blue background.",
    ),
    medium: "Acrylic on canvas",
    creationDate: "2025-12-29",
    dimensions: "8 × 10 inches (20 × 25 cm)",
    physicalSize: { widthCm: 20, heightCm: 25 },
    description:
      "Where silence becomes power, and the eye becomes law.\nThis painting captures authority that does not demand attention, yet cannot be ignored.",
    wall: "left",
    order: 1,
  },
  {
    id: "breath-of-the-arctic",
    title: "Breath of the Arctic",
    image: displayImage(
      "breath-of-the-arctic",
      "Painting of a polar bear walking straight toward the viewer across snow and ice, with mountains and green and violet northern lights behind.",
    ),
    medium: "Acrylic on canvas",
    creationDate: "2026-02-10",
    dimensions: "12 × 16 inches (30 × 40 cm)",
    physicalSize: { widthCm: 30, heightCm: 40 },
    description: "In the silence of ice, life still breathes.",
    wall: "right",
    order: 2,
  },
  {
    id: "the-weight-of-silence",
    title: "The Weight of Silence",
    image: displayImage(
      "the-weight-of-silence",
      "Painting of a cheetah's head and shoulders, gazing to the left against a soft orange and grey background.",
    ),
    medium: "Acrylic on canvas",
    creationDate: "2026-04-02",
    dimensions: "12 × 16 inches (30 × 40 cm)",
    physicalSize: { widthCm: 30, heightCm: 40 },
    description:
      "Not all power makes a sound.\nIn the stillness, there is focus.\nIn the quiet, there is control.\nThis moment isn't empty—it's waiting.",
    wall: "left",
    order: 3,
  },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** "2025-12-29" → "29 December 2025". Parsed by hand so server and client always agree (no time zones). */
export function formatCreationDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
