import { CatmullRomCurve3, Matrix4, Quaternion, Vector3, type PerspectiveCamera } from "three";
import { CORRIDOR, DOORWAY, EYE_HEIGHT, PORTICO, TABLET } from "./layout";
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
  /**
   * Shift-lens framing. The camera itself faces `facing` here, and the view toward `target` is kept by shifting
   * the lens instead (see LensShift), so a camera facing a wall square on keeps the wall's verticals and
   * horizontals straight however far its view is aimed up or to the side. The shift is fitted so that `subject`,
   * the corners of what is framed (a painting's frame, the entrance's doorway), keeps its place and size on screen.
   */
  lens?: { facing: Vec3; subject: readonly Vec3[] };
}

/**
 * One step of the scroll route. Steps play back to back; a step with `to` moves
 * the camera to that waypoint, a step without it holds the camera still.
 */
export interface RouteStep {
  id: string;
  duration: number;
  to?: number;
  /** Path speed (metres per timeline unit) at the start and end of a moving step; the camera rig eases between them. */
  startSpeed?: number;
  endSpeed?: number;
  /** Straight-line length of a moving step in metres, from which its duration is set. */
  length?: number;
  /** Index into galleryLayout of the painting whose information is shown during this step. */
  paintingIndex?: number;
}

export interface CameraRoute {
  waypoints: CameraWaypoint[];
  steps: RouteStep[];
}

/** Vertical field of view (degrees) the landscape framing is composed for; wider screens keep it. */
export const BASE_FOV = 42;
/**
 * Share of the screen height a painting's frame fills when viewed. The viewing
 * distance is derived from each frame's size, so a small canvas is approached
 * more closely and still reads as a prominent, deliberately hung work.
 */
const VIEW_FILL = 0.66;
const VIEW_DISTANCE_RANGE = [3.6, 5.6] as const;
/** Sideways aim, as a share of the viewing distance, that places the painting left of the information panel. */
const VIEW_AIM_OFFSET = 0.145;
const VIEW_DISTANCE_PORTRAIT = 4.8;

function viewDistance(frameHeight: number): number {
  const ideal = frameHeight / (VIEW_FILL * 2 * Math.tan(((BASE_FOV / 2) * Math.PI) / 180));
  return Math.min(VIEW_DISTANCE_RANGE[1], Math.max(VIEW_DISTANCE_RANGE[0], ideal));
}
/** How far before a painting the camera starts turning toward it. */
const APPROACH_OFFSET = 3.8;
/** How far past a painting the camera stands once it has turned back to face down the corridor. */
const RESUME_OFFSET = 0.8;
/**
 * Walking pace in metres per timeline unit. Segment durations are derived from
 * their length at this pace, and eases are chosen so speed carries over between
 * segments: the camera accelerates from rest at the entrance, cruises through
 * the doorway and along the corridor, and decelerates into each painting.
 */
const CRUISE_SPEED = 5.5;

/** Fixed durations in timeline units (one unit = SCROLL_VH_PER_UNIT viewport heights of scrolling). */
const DURATION = {
  entranceHold: 0.7,
  /** Shortest turn toward a painting, so the rotation never feels rushed. */
  minTurn: 1.6,
  view: 1.9,
  resume: 1.15,
  endHold: 1.0,
} as const;

function distance(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/** The three waypoints around one painting, computed from where it hangs. */
function paintingWaypoints({ painting, side, position, frame }: PaintingLayout): [CameraWaypoint, CameraWaypoint, CameraWaypoint] {
  const [wallX, centerY, z] = position;
  const standOff = viewDistance(frame.outerHeight);
  // Portrait framing scales with the frame too, so a smaller canvas still fills a phone or tablet screen.
  const portraitScale = Math.min(1, standOff / VIEW_DISTANCE_RANGE[1]);
  const frameCorners = [-1, 1].flatMap((dy) =>
    [-1, 1].map((dz): Vec3 => [wallX, centerY + (dy * frame.outerHeight) / 2, z + (dz * frame.outerWidth) / 2]),
  );
  return [
    {
      // Walking down the centre line, glancing toward the painting's wall.
      id: `${painting.id}:approach`,
      position: [-side * 0.3, EYE_HEIGHT, z + APPROACH_OFFSET],
      target: [side * 1.5, 2.2, z - 4],
    },
    {
      // Square on to the painting. Facing the wall, screen-right points along `side` in z, so aiming
      // slightly that way places the painting left of centre, clear of the information panel. The camera
      // faces the wall level and square on and shifts its lens toward the target, so the frame stays rectangular.
      id: `${painting.id}:view`,
      position: [wallX - side * standOff, EYE_HEIGHT, z + side * 0.15],
      target: [wallX, centerY - 0.05, z + side * standOff * VIEW_AIM_OFFSET],
      lens: { facing: [side, 0, 0], subject: frameCorners },
      portrait: {
        // Further back and aimed low so the painting sits above the bottom information sheet.
        position: [wallX - side * VIEW_DISTANCE_PORTRAIT * portraitScale, EYE_HEIGHT, z],
        target: [wallX, centerY - 1.15 * portraitScale, z],
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
      // Looking up at the facade, the camera faces it level and square on and shifts its lens up instead, so the
      // arch, pilasters and doorway stand upright. The shift is fitted to the doorway from its threshold up to the
      // inscription above it, which keep their place on screen.
      lens: {
        facing: [0, 0, -1],
        subject: [0, TABLET.centerY].flatMap((y) => [-1, 1].map((side): Vec3 => [side * DOORWAY.halfWidth, y, 0])),
      },
      // Narrow screens stand further back to keep the whole arch in frame, but close enough to read the inscription.
      portrait: { position: [0, 2.0, PORTICO.depth + 15.5], target: [0, 4.9, 0] },
    },
    { id: "porch", position: [0, 1.85, PORTICO.depth + 4.5], target: [0, 3.0, -4] },
    { id: "threshold", position: [0, EYE_HEIGHT, CORRIDOR.startZ - 1.8], target: [0, 2.3, CORRIDOR.startZ - 18] },
  ];
  const steps: RouteStep[] = [{ id: "entrance", duration: DURATION.entranceHold }];
  const add = (waypoint: CameraWaypoint) => waypoints.push(waypoint) - 1;
  /** Adds a moving step to `waypoint`, timed from its length and its start/end speeds. */
  const move = (id: string, toIndex: number, startSpeed: number, endSpeed: number, minDuration = 0) => {
    const length = distance(waypoints[toIndex - 1].position, waypoints[toIndex].position);
    const average = (startSpeed + endSpeed) / 2;
    const duration = Math.max(minDuration, average > 0 ? length / average : 0);
    steps.push({ id, duration, to: toIndex, startSpeed, endSpeed, length });
  };

  // Accelerates from rest while the doors open, reaching cruising speed at the porch, and cruises through the doorway.
  move("doors", 1, 0, CRUISE_SPEED);
  move("threshold", 2, CRUISE_SPEED, CRUISE_SPEED);

  layouts.forEach((layout, i) => {
    const [approach, view, resume] = paintingWaypoints(layout);
    const id = layout.painting.id;
    // After the threshold the camera is already cruising; after a pause it sets off from rest.
    move(`walk:${id}`, add(approach), i === 0 ? CRUISE_SPEED : 0, CRUISE_SPEED, 0.6);
    // Decelerates into the viewing position while turning to face the painting.
    move(`turn:${id}`, add(view), CRUISE_SPEED, 0, DURATION.minTurn);
    steps.push({ id: `view:${id}`, duration: DURATION.view, paintingIndex: i });
    // Turns back to face down the corridor, starting and ending at rest.
    move(`resume:${id}`, add(resume), 0, 0, DURATION.resume);
  });

  const lastZ = layouts.length ? layouts[layouts.length - 1].position[2] : CORRIDOR.startZ - 6;
  const onwardIndex = add({ id: "onward", position: [0, EYE_HEIGHT, lastZ - 3.5], target: [0, 2.6, CORRIDOR.endZ] });
  move("onward", onwardIndex, 0, 0, 1.3);
  steps.push({ id: "end", duration: DURATION.endHold });

  return { waypoints, steps };
}

export const cameraRoute: CameraRoute = buildCameraRoute(galleryLayout);
export const cameraWaypoints = cameraRoute.waypoints;

/**
 * An off-axis (shifted) lens, as on a view camera with a rising and shifting front: the camera faces one way and
 * the picture is centred on another direction, so lines parallel to the image plane stay parallel on screen.
 * `x` and `y` are where the picture's centre lies on the image plane, in tangents right of and above the camera's
 * axis; `scale` widens the view by that factor. { x: 0, y: 0, scale: 1 } is the plain centred lens.
 */
export interface LensShift {
  x: number;
  y: number;
  scale: number;
}

/**
 * Applies a lens shift to a camera's projection. The view offset is part of the camera's own projection, so it
 * survives every later updateProjectionMatrix (a resize or a change of pixel ratio); it is recomputed here from
 * the camera's current field of view and aspect each time.
 */
export function applyLens(camera: PerspectiveCamera, { x, y, scale }: LensShift): void {
  if (x === 0 && y === 0 && scale === 1) {
    if (camera.view?.enabled) camera.clearViewOffset();
    return;
  }
  // In units of the unshifted view's height (setViewOffset sets the aspect to fullWidth / fullHeight): a window
  // `scale` times as large, centred where the tangents (x, y) fall.
  const { aspect } = camera;
  const tan = Math.tan(((camera.fov / 2) * Math.PI) / 180) / camera.zoom;
  camera.setViewOffset(aspect, 1, (aspect * (1 - scale)) / 2 + x / (2 * tan), (1 - scale) / 2 - y / (2 * tan), aspect * scale, scale);
}

const UP = new Vector3(0, 1, 0);

/** Heading about the vertical (from -Z toward +X) and elevation of a unit direction. */
function yawOf(direction: Vector3): number {
  return Math.atan2(direction.x, -direction.z);
}
function pitchOf(direction: Vector3): number {
  return Math.asin(Math.min(1, Math.max(-1, direction.y)));
}
function wrapAngle(angle: number): number {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

/** A camera's right and up axes as lookAt builds them with a fixed world up, for a unit forward direction. */
function cameraAxes(forward: Vector3, outRight: Vector3, outUp: Vector3): void {
  outRight.crossVectors(forward, UP).normalize();
  outUp.crossVectors(outRight, forward);
}

/** Where a camera-relative vector falls on a camera's image plane, in tangents right of and above its axis. */
function tangents(v: Vector3, forward: Vector3, right: Vector3, up: Vector3): [number, number] {
  const depth = v.dot(forward);
  return [v.dot(right) / depth, v.dot(up) / depth];
}

/**
 * At a shift-lens waypoint, how to adjust the lens that centres the look direction (as the rig computes it
 * throughout a turn) for the subject's corners to stay as close to their places on screen without a shift as one
 * lens can keep them: a least-squares fit, which keeps the subject's centre and its mean size. Returned as
 * [x and y to add, log of the scale]. A surface seen square on keeps its true proportions, so where the plain view
 * stretched it one way (off-axis or foreshortened) its width and height differ by that stretch, split evenly.
 */
function lensTrim(position: Vector3, look: Vector3, facing: Vector3, subject: readonly Vec3[]): [number, number, number] {
  const lookRight = new Vector3();
  const lookUp = new Vector3();
  const right = new Vector3();
  const up = new Vector3();
  cameraAxes(look, lookRight, lookUp);
  cameraAxes(facing, right, up);
  const corners = subject.map((corner) => new Vector3(...corner).sub(position));
  const plain = corners.map((v) => tangents(v, look, lookRight, lookUp));
  const shifted = corners.map((v) => tangents(v, facing, right, up));
  // Fit shifted ≈ lens + scale × plain: the corners' screen positions through the lens are (shifted - lens) / scale.
  const mean = (points: [number, number][]) => points.reduce(([x, y], [px, py]) => [x + px / points.length, y + py / points.length], [0, 0]);
  const [plainX, plainY] = mean(plain);
  const [shiftedX, shiftedY] = mean(shifted);
  let covariance = 0;
  let variance = 0;
  plain.forEach(([px, py], k) => {
    covariance += (px - plainX) * (shifted[k][0] - shiftedX) + (py - plainY) * (shifted[k][1] - shiftedY);
    variance += (px - plainX) ** 2 + (py - plainY) ** 2;
  });
  const scale = covariance / variance;
  const [centredX, centredY] = tangents(look, facing, right, up);
  return [shiftedX - scale * plainX - centredX, shiftedY - scale * plainY - centredY, Math.log(scale)];
}

/**
 * Samples per segment for the distance and turn-angle tables. Lookups interpolate linearly between samples, so
 * the rate of motion steps slightly at each sample; this many keeps those steps well below a degree per second.
 */
const ARC_SAMPLES = 256;

/**
 * Cubic ease whose slope is `startSlope` at 0 and `endSlope` at 1 (in units of
 * the segment's average speed). Adjacent segments are given matching speeds, so
 * the camera never jumps in speed where one segment hands over to the next.
 * Slopes are capped at 3, which keeps the curve monotonic (no backtracking).
 */
function matchedSpeedEase(startSlope: number, endSlope: number): (u: number) => number {
  const a = Math.min(3, Math.max(0, startSlope));
  const b = Math.min(3, Math.max(0, endSlope));
  return (u) => {
    const u2 = u * u;
    const u3 = u2 * u;
    return (u3 - 2 * u2 + u) * a + (-2 * u3 + 3 * u2) + (u3 - u2) * b;
  };
}

/**
 * Smooth (C1) interpolation through (times[k], values[k]) for values that never
 * decrease, with Fritsch-Butland slopes: it never overshoots, so the value never
 * runs backwards, and it stays exactly constant across a run of equal values.
 */
class MonotoneCurve {
  private readonly slopes: number[];

  constructor(
    private readonly times: readonly number[],
    private readonly values: readonly number[],
  ) {
    const secant = (k: number) => (values[k + 1] - values[k]) / (times[k + 1] - times[k]);
    this.slopes = times.map((_, k) => {
      // The route starts and ends at rest.
      if (k === 0 || k === times.length - 1) return 0;
      const before = secant(k - 1);
      const after = secant(k);
      if (before <= 0 || after <= 0) return 0;
      const h0 = times[k] - times[k - 1];
      const h1 = times[k + 1] - times[k];
      return (3 * (h0 + h1)) / ((2 * h1 + h0) / before + (h1 + 2 * h0) / after);
    });
  }

  at(t: number): number {
    const { times, values, slopes } = this;
    const n = times.length;
    if (t <= times[0]) return values[0];
    if (t >= times[n - 1]) return values[n - 1];
    let k = 0;
    while (t > times[k + 1]) k++;
    const h = times[k + 1] - times[k];
    const s = (t - times[k]) / h;
    const s2 = s * s;
    const s3 = s2 * s;
    return values[k] + (values[k + 1] - values[k]) * (3 * s2 - 2 * s3) + h * (slopes[k] * (s3 - 2 * s2 + s) + slopes[k + 1] * (s3 - s2));
  }
}

/** Cumulative measure along one spline segment, normalised to 0..1, at evenly spaced parameter steps. */
function normalise(table: Float32Array): number {
  const total = table[ARC_SAMPLES];
  for (let k = 1; k <= ARC_SAMPLES; k++) table[k] = total > 1e-6 ? table[k] / total : k / ARC_SAMPLES;
  return total;
}

/** Converts a fraction of a segment's total (distance or turn) into the spline parameter within that segment. */
function paramForFraction(table: Float32Array, fraction: number): number {
  let lo = 0;
  let hi = ARC_SAMPLES;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (table[mid] < fraction) lo = mid;
    else hi = mid;
  }
  const span = table[hi] - table[lo];
  const f = span > 1e-6 ? (fraction - table[lo]) / span : 0;
  return (lo + f) / ARC_SAMPLES;
}

/** A moving step of the route on the scroll timeline: the segment it travels and how it eases along it. */
interface TimedMove {
  start: number;
  end: number;
  segment: number;
  ease: (u: number) => number;
}

/**
 * Turns a position on the scroll timeline into a camera pose.
 *
 * - Position follows a centripetal Catmull-Rom spline (no overshoot through
 *   walls). Each moving step eases along its segment between the start and end
 *   speeds the route gives it, measured on this path's own length (portrait
 *   framing moves some waypoints), so the camera's speed carries over smoothly
 *   wherever one step hands over to the next.
 * - The viewing direction follows its own smooth spline through each
 *   waypoint's look direction. How far along that spline the camera has turned
 *   is a smooth function of timeline time through every waypoint, so the rate
 *   of turning never jumps (even where the camera walks straight through a
 *   waypoint), turns build up and settle gently, and the camera is still
 *   whenever the route holds. Orientation is rebuilt with lookAt and a fixed
 *   world up every frame: the camera never rolls, and because neighbouring
 *   directions are always less than 180° apart it always turns the short way.
 * - Where a waypoint has a shift lens, the camera body turns from the look
 *   direction to its `facing` as the camera turns toward the waypoint, and
 *   back as it turns away, by the same share of each turn (eased in and out).
 *   A lens shift keeps the look direction at the centre of the picture, and
 *   by the same share the shift is fitted to the subject (see lensTrim).
 *   Between other waypoints the lens is plain.
 *
 * At every waypoint the pose is exactly the waypoint's own.
 */
export class CameraRig {
  private readonly positions: CatmullRomCurve3;
  private readonly directions: CatmullRomCurve3;
  private readonly arcTables: Float32Array[] = [];
  private readonly turnTables: Float32Array[] = [];
  /** Cumulative turn angle (radians) along the direction spline at each waypoint. */
  private readonly turnAt: number[] = [0];
  /** At each waypoint, the camera body's turn [yaw, pitch] (radians) from the look direction to its `facing`. */
  private readonly bodyTurns: (readonly [number, number])[];
  /** At each waypoint, the lens trim that fits the shift to its subject (see lensTrim). */
  private readonly lensTrims: (readonly [number, number, number])[];
  private readonly moves: TimedMove[] = [];
  private readonly turn: MonotoneCurve;
  private readonly last: number;
  private readonly direction = new Vector3();
  private readonly facing = new Vector3();
  private readonly right = new Vector3();
  private readonly up = new Vector3();
  private readonly lookTarget = new Vector3();
  private readonly matrix = new Matrix4();

  constructor({ waypoints, steps }: CameraRoute, portrait: boolean) {
    const positions = waypoints.map((w) => new Vector3(...((portrait && w.portrait?.position) || w.position)));
    const directions = waypoints.map((w, i) =>
      new Vector3(...((portrait && w.portrait?.target) || w.target)).sub(positions[i]).normalize(),
    );
    this.positions = new CatmullRomCurve3(positions, false, "centripetal");
    this.directions = new CatmullRomCurve3(directions, false, "centripetal");
    this.last = waypoints.length - 1;
    const facings = waypoints.map((w) => (w.lens ? new Vector3(...w.lens.facing).normalize() : null));
    this.bodyTurns = facings.map((facing, i) =>
      facing ? [wrapAngle(yawOf(facing) - yawOf(directions[i])), pitchOf(facing) - pitchOf(directions[i])] : [0, 0],
    );
    this.lensTrims = facings.map((facing, i) => {
      const subject = waypoints[i].lens?.subject;
      return facing && subject ? lensTrim(positions[i], directions[i], facing, subject) : [0, 0, 0];
    });

    // Distance travelled and angle turned along each segment, at evenly spaced spline parameters.
    const lengths: number[] = [];
    const p0 = new Vector3();
    const p1 = new Vector3();
    const d0 = new Vector3();
    const d1 = new Vector3();
    for (let i = 0; i < this.last; i++) {
      const arc = new Float32Array(ARC_SAMPLES + 1);
      const turn = new Float32Array(ARC_SAMPLES + 1);
      this.positions.getPoint(i / this.last, p0);
      this.directions.getPoint(i / this.last, d0).normalize();
      for (let k = 1; k <= ARC_SAMPLES; k++) {
        const u = (i + k / ARC_SAMPLES) / this.last;
        this.positions.getPoint(u, p1);
        this.directions.getPoint(u, d1).normalize();
        arc[k] = arc[k - 1] + p0.distanceTo(p1);
        turn[k] = turn[k - 1] + d0.angleTo(d1);
        p0.copy(p1);
        d0.copy(d1);
      }
      lengths.push(normalise(arc));
      this.turnAt.push(this.turnAt[i] + normalise(turn));
      this.arcTables.push(arc);
      this.turnTables.push(turn);
    }

    // Steps play back to back on the timeline, each moving step advancing one waypoint. The camera's turn
    // reaches each waypoint's direction when the camera reaches the waypoint.
    let time = 0;
    let at = 0;
    const knotTimes = [0];
    const knotTurns = [0];
    for (const step of steps) {
      const start = time;
      time += step.duration;
      if (step.to !== undefined) {
        const average = lengths[at] / step.duration;
        const ease = average > 0 ? matchedSpeedEase((step.startSpeed ?? 0) / average, (step.endSpeed ?? 0) / average) : matchedSpeedEase(0, 0);
        this.moves.push({ start, end: time, segment: at, ease });
        at = step.to;
      }
      knotTimes.push(time);
      knotTurns.push(this.turnAt[at]);
    }
    this.turn = new MonotoneCurve(knotTimes, knotTurns);
  }

  /**
   * `time` is the position on the scroll timeline, in timeline units. Without `outLens` the camera always faces
   * its look direction; with it, the camera faces as described above and `outLens` receives the matching shift.
   */
  sample(time: number, outPosition: Vector3, outQuaternion: Quaternion, outLens?: LensShift): void {
    // The step under way, or the waypoint the camera has come to rest at.
    let segment = 0;
    let fraction = 0;
    for (const move of this.moves) {
      if (time >= move.end) {
        segment = move.segment;
        fraction = 1;
        continue;
      }
      if (time > move.start) {
        segment = move.segment;
        fraction = move.ease((time - move.start) / (move.end - move.start));
      }
      break;
    }
    this.positions.getPoint((segment + paramForFraction(this.arcTables[segment], fraction)) / this.last, outPosition);

    // How far the camera has turned, located on the direction spline.
    const turned = this.turn.at(time);
    let i = 0;
    while (i < this.last - 1 && turned > this.turnAt[i + 1]) i++;
    const span = this.turnAt[i + 1] - this.turnAt[i];
    const share = span > 1e-9 ? Math.min(1, Math.max(0, (turned - this.turnAt[i]) / span)) : 0;
    this.directions.getPoint((i + paramForFraction(this.turnTables[i], share)) / this.last, this.direction).normalize();

    // The camera body's turn away from the look direction, blended between this turn's two waypoints.
    const blend = share * share * (3 - 2 * share);
    const [yawFrom, pitchFrom] = this.bodyTurns[i];
    const [yawTo, pitchTo] = this.bodyTurns[i + 1];
    const yawTurn = yawFrom + (yawTo - yawFrom) * blend;
    const pitchTurn = pitchFrom + (pitchTo - pitchFrom) * blend;
    if (!outLens || (yawTurn === 0 && pitchTurn === 0)) {
      if (outLens) {
        outLens.x = 0;
        outLens.y = 0;
        outLens.scale = 1;
      }
      this.lookTarget.copy(outPosition).add(this.direction);
      outQuaternion.setFromRotationMatrix(this.matrix.lookAt(outPosition, this.lookTarget, UP));
      return;
    }
    const yaw = yawOf(this.direction) + yawTurn;
    const pitch = pitchOf(this.direction) + pitchTurn;
    this.facing.set(Math.cos(pitch) * Math.sin(yaw), Math.sin(pitch), -Math.cos(pitch) * Math.cos(yaw));
    this.lookTarget.copy(outPosition).add(this.facing);
    outQuaternion.setFromRotationMatrix(this.matrix.lookAt(outPosition, this.lookTarget, UP));
    // The lens that centres the look direction on the camera's own image plane, trimmed toward the subject's fit.
    cameraAxes(this.facing, this.right, this.up);
    const depth = this.direction.dot(this.facing);
    const [xFrom, yFrom, scaleFrom] = this.lensTrims[i];
    const [xTo, yTo, scaleTo] = this.lensTrims[i + 1];
    outLens.x = this.direction.dot(this.right) / depth + xFrom + (xTo - xFrom) * blend;
    outLens.y = this.direction.dot(this.up) / depth + yFrom + (yTo - yFrom) * blend;
    outLens.scale = Math.exp(scaleFrom + (scaleTo - scaleFrom) * blend);
  }
}
