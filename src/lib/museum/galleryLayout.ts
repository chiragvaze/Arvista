import type { GalleryWall, Painting } from "@/types/artwork";
import { paintings } from "@/content/paintings";
import { CORRIDOR, PAINTING_CENTER_HEIGHT, bayCenterZ } from "./layout";

/**
 * Hanging plan for the collection, derived entirely from painting metadata:
 * which wall and bay each work hangs in, how it is oriented, and how large its
 * frame and mat are. Camera waypoints and the scroll timeline are built from it,
 * so adding a painting to the content file extends the whole exhibition.
 */

/** Paintings are shown larger than life so they read at corridor scale; all share one factor so relative sizes stay true. */
export const ARTWORK_DISPLAY_SCALE = 4.2;
/** Used when a painting has no physical size. */
const DEFAULT_ARTWORK_HEIGHT = 1.6;

export const FRAME_PROFILE = {
  /** Width of the wooden moulding. */
  moulding: 0.13,
  /** Narrowest mat allowed around the artwork. */
  minMat: 0.12,
  /**
   * Frames are matted up toward a common outer height, so a smaller canvas gets
   * a wider mat instead of being enlarged to match its neighbours.
   */
  targetOuterHeight: 2.25,
} as const;

export interface FrameLayout {
  artWidth: number;
  artHeight: number;
  mat: number;
  outerWidth: number;
  outerHeight: number;
}

export function frameLayout(painting: Painting): FrameLayout {
  const aspect = painting.image.width / painting.image.height;
  const artHeight = painting.physicalSize
    ? (painting.physicalSize.heightCm / 100) * ARTWORK_DISPLAY_SCALE
    : DEFAULT_ARTWORK_HEIGHT;
  const artWidth = artHeight * aspect;
  const mat = Math.max(FRAME_PROFILE.minMat, (FRAME_PROFILE.targetOuterHeight - 2 * FRAME_PROFILE.moulding - artHeight) / 2);
  const border = 2 * (mat + FRAME_PROFILE.moulding);
  return { artWidth, artHeight, mat, outerWidth: artWidth + border, outerHeight: artHeight + border };
}

export interface PaintingLayout {
  painting: Painting;
  /** 0-based position in the hanging sequence. */
  index: number;
  bay: number;
  wall: GalleryWall;
  /** -1 for the left wall (x < 0), +1 for the right wall. */
  side: -1 | 1;
  /** Centre of the frame on the wall surface. */
  position: [number, number, number];
  /** Rotation about Y so the painting faces into the corridor. */
  rotationY: number;
  frame: FrameLayout;
}

export function layoutGallery(collection: readonly Painting[]): PaintingLayout[] {
  return [...collection]
    .sort((a, b) => a.order - b.order)
    .map((painting, index) => {
      // Alternate walls (left first) unless the painting names its wall.
      const wall: GalleryWall = painting.wall ?? (index % 2 === 0 ? "left" : "right");
      const side = wall === "left" ? -1 : 1;
      const bay = index + 1;
      return {
        painting,
        index,
        bay,
        wall,
        side,
        position: [side * CORRIDOR.halfWidth, PAINTING_CENTER_HEIGHT, bayCenterZ(bay)],
        rotationY: -side * (Math.PI / 2),
        frame: frameLayout(painting),
      };
    });
}

export const galleryLayout: PaintingLayout[] = layoutGallery(paintings);
