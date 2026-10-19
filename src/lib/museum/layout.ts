import { paintings } from "@/content/paintings";

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
  maxOpenAngle: (92 * Math.PI) / 180,
} as const;

/** The carved tablet sits in the lunette between the door surround and the porch vault. */
export const TABLET = { width: 4.3, centerY: 9.3 } as const;

/** Bays: an entry bay, one bay per painting, a bay with a bench, and a final bay before the end wall. */
export function corridorBayCount(paintingCount: number): number {
  return Math.max(paintingCount, 1) + 3;
}

const BAY_COUNT = corridorBayCount(paintings.length);
const FIRST_BAY_Z = -2;
const BAY_LENGTH = 7;

export const CORRIDOR = {
  halfWidth: 5,
  wallHeight: 6.5,
  startZ: -INNER_FACADE.thickness,
  /** Pilasters and vault ribs divide the corridor into bays; the corridor grows with the collection. */
  firstBayZ: FIRST_BAY_Z,
  bayLength: BAY_LENGTH,
  bayCount: BAY_COUNT,
  endZ: FIRST_BAY_Z - BAY_LENGTH * BAY_COUNT - 2,
} as const;

export const VAULT_RADIUS = CORRIDOR.halfWidth;

/** Centre z of a corridor bay (0-based). Painting n hangs in bay n. */
export function bayCenterZ(bayIndex: number): number {
  return CORRIDOR.firstBayZ - CORRIDOR.bayLength * (bayIndex + 0.5);
}

/** z positions of the pilasters / vault ribs between bays. */
export function bayDividerZs(): number[] {
  return Array.from({ length: CORRIDOR.bayCount + 1 }, (_, i) => CORRIDOR.firstBayZ - CORRIDOR.bayLength * i);
}

/** Bay holding the bench, just past the last painting. */
export const BENCH_BAY = CORRIDOR.bayCount - 2;

/** Height of every frame's centre above the floor. */
export const PAINTING_CENTER_HEIGHT = 2.4;

/** Palm planters as [x, z]: either side of the doors in the portico, and in the corridor's first and last bays. */
export const PLANTER_SPOTS: readonly [number, number][] = [
  [-3.15, 1.25],
  [3.15, 1.25],
  ...[0, CORRIDOR.bayCount - 1].flatMap((bay) =>
    [-1, 1].map((side) => [side * (CORRIDOR.halfWidth - 1.0), bayCenterZ(bay)] as [number, number]),
  ),
];
