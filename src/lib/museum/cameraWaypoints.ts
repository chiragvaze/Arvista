import { CatmullRomCurve3, Matrix4, Quaternion, Vector3 } from "three";
import { CORRIDOR, EYE_HEIGHT, PORTICO, bayCenterZ, paintingPlacement } from "./layout";
import { featuredPainting } from "@/content/paintings";

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

const painting = paintingPlacement(featuredPainting.order, featuredPainting.wall);
const [paintingX, paintingY, paintingZ] = painting.position;
/** Unit vector pointing from the painting's wall into the corridor. */
const wallNormalX = featuredPainting.wall === "left" ? 1 : -1;
/** Viewing distance from the wall in landscape and portrait layouts. */
const VIEW_DISTANCE = 5.1;
const VIEW_DISTANCE_PORTRAIT = 6.4;

/**
 * Camera waypoints, in visiting order. The scroll timeline moves a continuous
 * parameter from 0 to waypoints.length - 1 through them.
 */
export const cameraWaypoints: CameraWaypoint[] = [
  {
    id: "entrance",
    position: [0, 2.0, PORTICO.depth + 13],
    target: [0, 4.4, 0],
    portrait: { position: [0, 2.0, PORTICO.depth + 17.5], target: [0, 4.6, 0] },
  },
  {
    id: "approach",
    position: [0, 1.85, PORTICO.depth + 4.5],
    target: [0, 3.0, -4],
  },
  {
    id: "threshold",
    position: [0, EYE_HEIGHT, CORRIDOR.startZ - 1.8],
    target: [0, 2.3, bayCenterZ(2)],
  },
  {
    id: "corridor",
    position: [0.35, EYE_HEIGHT, paintingZ + 4.6],
    target: [paintingX * 0.3, 2.2, paintingZ - 4],
  },
  {
    id: "painting",
    position: [paintingX + wallNormalX * VIEW_DISTANCE, EYE_HEIGHT, paintingZ - 0.15],
    // Aim slightly past the painting so it sits left of centre, leaving room for the information panel.
    target: [paintingX, paintingY - 0.05, paintingZ - 0.75],
    portrait: {
      position: [paintingX + wallNormalX * VIEW_DISTANCE_PORTRAIT, EYE_HEIGHT, paintingZ],
      // Aim below the painting so it sits in the upper half, above the information sheet.
      target: [paintingX, paintingY - 0.95, paintingZ],
    },
  },
  {
    id: "onward",
    position: [0, EYE_HEIGHT, bayCenterZ(3)],
    target: [0, 2.6, CORRIDOR.endZ],
  },
];

export type WaypointId = (typeof cameraWaypoints)[number]["id"];

export function waypointIndex(id: string): number {
  const index = cameraWaypoints.findIndex((w) => w.id === id);
  if (index < 0) throw new Error(`Unknown camera waypoint: ${id}`);
  return index;
}

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
