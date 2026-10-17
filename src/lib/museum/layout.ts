import type { GalleryWall } from "@/types/artwork";

/**
 * Architectural dimensions of the museum, in metres.
 *
 * Coordinate system: +Y is up, the visitor walks toward -Z. The front face of the
 * entrance portico sits at z = PORTICO.depth, the doors close the opening in the
 * inner facade, and the corridor runs from the inner facade toward -Z.
 */

export const EYE_HEIGHT = 1.7;

/** Outer facade with the large arch that frames the recessed portico. */
export const FACADE = {
  width: 34,
  height: 17,
  archHalfWidth: 4,
  archSpring: 7,
} as const;

/** Depth of the recessed portico between the outer facade and the doors. */
export const PORTICO = {
  depth: 3,
} as const;

/** Inner wall holding the doors. Its front face is at z = 0. */
export const INNER_FACADE = {
  thickness: 1,
  halfWidth: 6,
  height: 13,
} as const;

/** The arched door opening and the two door leaves that close it. */
export const DOORWAY = {
  halfWidth: 2.5,
  spring: 5.5,
  leafThickness: 0.16,
  /** Doors are hung on the interior face of the inner facade so they swing into the building. */
  hingeZ: -INNER_FACADE.thickness,
  maxOpenAngle: (95 * Math.PI) / 180,
} as const;

export const CORRIDOR = {
  halfWidth: 5,
  wallHeight: 6.5,
  startZ: -INNER_FACADE.thickness,
  endZ: -46,
  /** Pilasters and vault ribs divide the corridor into bays. */
  firstBayZ: -2,
  bayLength: 7,
  bayCount: 6,
} as const;

export const VAULT_RADIUS = CORRIDOR.halfWidth;

/** Centre z of a corridor bay (0-based). Paintings hang at bay centres. */
export function bayCenterZ(bayIndex: number): number {
  return CORRIDOR.firstBayZ - CORRIDOR.bayLength * (bayIndex + 0.5);
}

/** z positions of the pilasters / vault ribs between bays. */
export function bayDividerZs(): number[] {
  return Array.from({ length: CORRIDOR.bayCount + 1 }, (_, i) => CORRIDOR.firstBayZ - CORRIDOR.bayLength * i);
}

export const PAINTING_CENTER_HEIGHT = 2.4;

export interface WallPlacement {
  position: [number, number, number];
  /** Rotation about Y so the painting faces into the corridor. */
  rotationY: number;
}

/**
 * Where a painting hangs. Paintings alternate walls by order; order 1 uses bay 1
 * so the visitor has walked a little way into the corridor before the first work.
 */
export function paintingPlacement(order: number, wall: GalleryWall): WallPlacement {
  const z = bayCenterZ(order);
  const x = wall === "left" ? -CORRIDOR.halfWidth : CORRIDOR.halfWidth;
  return {
    position: [x, PAINTING_CENTER_HEIGHT, z],
    rotationY: wall === "left" ? Math.PI / 2 : -Math.PI / 2,
  };
}
