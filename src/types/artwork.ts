export type GalleryWall = "left" | "right";

export interface ArtworkImage {
  /** Optimised display image (path under /public). Used for the 3D texture on desktop and the collection page. */
  src: string;
  /** Smaller display image for phones and tablets. */
  srcSmall?: string;
  /** The untouched source photograph. */
  original?: string;
  /** Pixel size of `src`; its ratio is the painting's displayed aspect ratio. */
  width: number;
  height: number;
  /** Describes what the painting depicts, for screen readers. */
  alt: string;
}

/** Physical size of the canvas. */
export interface PhysicalSize {
  widthCm: number;
  heightCm: number;
}

export interface Painting {
  id: string;
  title: string;
  image: ArtworkImage;
  medium?: string;
  /** ISO 8601 date (YYYY-MM-DD). */
  creationDate?: string;
  /** Dimensions as the artist states them, shown verbatim. */
  dimensions?: string;
  /** Used to scale paintings relative to each other in the 3D gallery. */
  physicalSize?: PhysicalSize;
  description?: string;
  /** Which corridor wall the painting hangs on. Defaults to alternating by order, starting on the left. */
  wall?: GalleryWall;
  /** Hanging order along the corridor, starting at 1 nearest the entrance. */
  order: number;
  /** Marks example content that must be replaced with real artwork details. */
  isPlaceholder?: boolean;
}
