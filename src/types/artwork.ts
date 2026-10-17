export type GalleryWall = "left" | "right";

export interface ArtworkImage {
  /** Path under /public or an absolute URL. */
  src: string;
  /** Intrinsic pixel size; used for the HTML fallback and as the initial aspect ratio. */
  width: number;
  height: number;
  /** Meaningful description of what the painting depicts. */
  alt: string;
}

export interface Painting {
  id: string;
  title: string;
  image: ArtworkImage;
  year?: number;
  medium?: string;
  dimensions?: string;
  description?: string;
  /** Which corridor wall the painting hangs on. */
  wall: GalleryWall;
  /** Hanging order along the corridor, starting at 1 nearest the entrance. */
  order: number;
  /** Height of the painted surface in the 3D scene, in metres. Width follows the image aspect ratio. */
  displayHeight?: number;
  /** Marks example content that must be replaced with real artwork details. */
  isPlaceholder?: boolean;
}
