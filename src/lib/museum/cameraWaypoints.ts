import { CatmullRomCurve3, Matrix4, Quaternion, Vector3 } from "three";
import { CORRIDOR, EYE_HEIGHT, PORTICO } from "./layout";
import { galleryLayout, type PaintingLayout } from "./galleryLayout";

export type Vec3 = readonly [number, number, number];

export interface CameraPose {
  position: Vec3;
  /** Point the camera looks at. Orientation is derived with lookAt, never with raw Euler angles. */
  target: Vec3;
}

export interface CameraWaypoint extends CameraPose {
  id: string;
  /** Optional framing for tall, narrow viewports (phones in portrait). */
  portrait?: Partial<CameraPose>;
}

/**
 * One step of the scroll route. Steps play back to back; a step with `to` moves
 * the camera to that waypoint, a step without it holds the camera still.
 */
export interface RouteStep {
  id: string;
  duration: number;
  to?: number;
  ease?: string;
  /** Index into galleryLayout of the painting whose information is shown during this step. */
  paintingIndex?: number;
}

export interface CameraRoute {
  waypoints: CameraWaypoint[];
  steps: RouteStep[];
}

/** Distance from the wall when viewing a painting, landscape and portrait. */
const VIEW_DISTANCE = 5.1;
const VIEW_DISTANCE_PORTRAIT = 4.8;
/** How far before a painting the camera starts turning toward it. */
const APPROACH_OFFSET = 3.8;
/** How far past a painting the camera stands once it has turned back to face down the corridor. */
const RESUME_OFFSET = 0.8;
/** Corridor walking pace, in metres per timeline unit. */
const WALK_SPEED = 4.2;

/** Durations in timeline units (one unit = SCROLL_VH_PER_UNIT viewport heights of scrolling). */
const DURATION = {
  entranceHold: 0.7,
  doors: 2.4,
  threshold: 1.5,
  turn: 1.7,
  view: 1.9,
  resume: 1.1,
  endHold: 0.4,
} as const;

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** The three waypoints around one painting, computed from where it hangs. */
function paintingWaypoints({ painting, side, position }: PaintingLayout): [CameraWaypoint, CameraWaypoint, CameraWaypoint] {
  const [wallX, centerY, z] = position;
  return [
    {
      // Walking down the centre line, glancing toward the painting's wall.
      id: `${painting.id}:approach`,
      position: [-side * 0.3, EYE_HEIGHT, z + APPROACH_OFFSET],
      target: [side * 1.5, 2.2, z - 4],
    },
    {
      // Square on to the painting. Facing the wall, screen-right points along `side` in z, so aiming
      // slightly that way places the painting left of centre, clear of the information panel.
      id: `${painting.id}:view`,
      position: [wallX - side * VIEW_DISTANCE, EYE_HEIGHT, z + side * 0.15],
      target: [wallX, centerY - 0.05, z + side * 0.75],
      portrait: {
        // Further back and aimed low so the painting sits above the bottom information sheet.
        position: [wallX - side * VIEW_DISTANCE_PORTRAIT, EYE_HEIGHT, z],
        target: [wallX, centerY - 1.3, z],
      },
    },
    {
      // Turned back to face down the corridor before walking on.
      id: `${painting.id}:resume`,
      position: [0, EYE_HEIGHT, z - RESUME_OFFSET],
      target: [0, 2.25, z - 14],
    },
  ];
}

/**
 * Builds the full camera route: the fixed entrance sequence, then approach,
 * turn, pause and turn-back for every painting in hanging order, then the walk
 * toward the next hall.
 */
export function buildCameraRoute(layouts: readonly PaintingLayout[]): CameraRoute {
  const waypoints: CameraWaypoint[] = [
    {
      id: "entrance",
      position: [0, 2.0, PORTICO.depth + 13],
      target: [0, 4.4, 0],
      portrait: { position: [0, 2.0, PORTICO.depth + 17.5], target: [0, 4.6, 0] },
    },
    { id: "porch", position: [0, 1.85, PORTICO.depth + 4.5], target: [0, 3.0, -4] },
    { id: "threshold", position: [0, EYE_HEIGHT, CORRIDOR.startZ - 1.8], target: [0, 2.3, CORRIDOR.startZ - 18] },
  ];
  const steps: RouteStep[] = [
    { id: "entrance", duration: DURATION.entranceHold },
    { id: "doors", duration: DURATION.doors, to: 1, ease: "power1.in" },
    { id: "threshold", duration: DURATION.threshold, to: 2 },
  ];

  const add = (waypoint: CameraWaypoint) => waypoints.push(waypoint) - 1;

  layouts.forEach((layout, i) => {
    const [approach, view, resume] = paintingWaypoints(layout);
    const from = waypoints[waypoints.length - 1].position;
    const walk = add(approach);
    steps.push({
      id: `walk:${layout.painting.id}`,
      duration: Math.max(0.6, distance(from, approach.position) / WALK_SPEED),
      to: walk,
      // After a pause the camera starts from rest; after the threshold it is already moving.
      ease: i === 0 ? "none" : "power1.in",
    });
    steps.push({ id: `turn:${layout.painting.id}`, duration: DURATION.turn, to: add(view), ease: "power1.out" });
    steps.push({ id: `view:${layout.painting.id}`, duration: DURATION.view, paintingIndex: i });
    steps.push({ id: `resume:${layout.painting.id}`, duration: DURATION.resume, to: add(resume), ease: "power1.inOut" });
  });

  const lastZ = layouts.length ? layouts[layouts.length - 1].position[2] : CORRIDOR.startZ - 6;
  const onward: CameraWaypoint = { id: "onward", position: [0, EYE_HEIGHT, lastZ - 3.5], target: [0, 2.6, CORRIDOR.endZ] };
  const from = waypoints[waypoints.length - 1].position;
  steps.push({
    id: "onward",
    duration: Math.max(1.2, distance(from, onward.position) / (WALK_SPEED * 0.6)),
    to: add(onward),
    ease: "power1.inOut",
  });
  steps.push({ id: "end", duration: DURATION.endHold });

  return { waypoints, steps };
}

export const cameraRoute: CameraRoute = buildCameraRoute(galleryLayout);
export const cameraWaypoints = cameraRoute.waypoints;

const UP = new Vector3(0, 1, 0);

/**
 * Samples a smooth camera path through the waypoints.
 * Position follows a centripetal Catmull-Rom spline (no overshoot through walls);
 * orientation is a shortest-path slerp between per-waypoint lookAt rotations, so
 * the camera can never spin the long way round and face away from the target.
 */
export class CameraRig {
  private readonly curve: CatmullRomCurve3;
  private readonly orientations: Quaternion[];
  private readonly last: number;

  constructor(waypoints: CameraWaypoint[], portrait: boolean) {
    const poses = waypoints.map((w) => ({
      position: new Vector3(...((portrait && w.portrait?.position) || w.position)),
      target: new Vector3(...((portrait && w.portrait?.target) || w.target)),
    }));
    this.curve = new CatmullRomCurve3(
      poses.map((p) => p.position),
      false,
      "centripetal",
    );
    const m = new Matrix4();
    this.orientations = poses.map((p) => new Quaternion().setFromRotationMatrix(m.lookAt(p.position, p.target, UP)));
    this.last = waypoints.length - 1;
  }

  /** t is in waypoint units: 0 = first waypoint, 1 = second, ... */
  sample(t: number, outPosition: Vector3, outQuaternion: Quaternion): void {
    const clamped = Math.min(Math.max(t, 0), this.last);
    this.curve.getPoint(clamped / this.last, outPosition);
    const i = Math.min(Math.floor(clamped), this.last - 1);
    outQuaternion.slerpQuaternions(this.orientations[i], this.orientations[i + 1], clamped - i);
  }
}
