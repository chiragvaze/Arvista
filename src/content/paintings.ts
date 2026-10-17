import type { Painting } from "@/types/artwork";

/**
 * Paintings shown in the gallery, in hanging order.
 *
 * To show your own work, drop the image into /public/artworks and replace the
 * placeholder entry below. The 3D frame reads the image's real aspect ratio,
 * so portrait and landscape works are both framed without stretching.
 */
export const paintings: Painting[] = [
  {
    id: "placeholder-01",
    title: "Placeholder Artwork",
    image: {
      src: "/artworks/placeholder-01.svg",
      width: 1200,
      height: 1500,
      alt: "Temporary placeholder: an abstract dusk landscape of layered ochre hills under a pale sky, labelled as placeholder artwork.",
    },
    medium: "Example: oil on canvas",
    dimensions: "Example: 60 × 75 cm",
    description:
      "This is a temporary placeholder, not a real painting. Replace the image and these details in src/content/paintings.ts with your own artwork, its title, year, medium, dimensions and the story behind it.",
    wall: "left",
    order: 1,
    displayHeight: 2.0,
    isPlaceholder: true,
  },
];

export const featuredPainting: Painting = paintings[0];
