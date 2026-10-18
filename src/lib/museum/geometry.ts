import { BoxGeometry, BufferAttribute, ExtrudeGeometry, Float32BufferAttribute, Shape, type BufferGeometry, type ExtrudeGeometryOptions } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/**
 * Builders for the museum's architectural profiles. Shapes are drawn in the XY
 * plane (metres) and extruded toward +Z. Arches are traced point by point so the
 * outline is always a simple polygon that triangulates cleanly.
 */

const ARC_SEGMENTS = 48;

/** Points of a semicircular arch from the left springing point over the crown to the right. */
function archPoints(halfWidth: number, spring: number, centerX = 0): [number, number][] {
  const points: [number, number][] = [];
  for (let i = 0; i <= ARC_SEGMENTS; i++) {
    const a = Math.PI - (i / ARC_SEGMENTS) * Math.PI;
    points.push([centerX + Math.cos(a) * halfWidth, spring + Math.sin(a) * halfWidth]);
  }
  return points;
}

function shapeFrom(points: [number, number][]): Shape {
  const shape = new Shape();
  shape.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1]);
  shape.closePath();
  return shape;
}

/** A rectangular wall with an arched opening cut up from its base. */
export function archedWallGeometry(opts: {
  width: number;
  height: number;
  archHalfWidth: number;
  archSpring: number;
  depth: number;
}): ExtrudeGeometry {
  const { width, height, archHalfWidth, archSpring, depth } = opts;
  const w = width / 2;
  const points: [number, number][] = [
    [-w, 0],
    [-archHalfWidth, 0],
    ...archPoints(archHalfWidth, archSpring),
    [archHalfWidth, 0],
    [w, 0],
    [w, height],
    [-w, height],
  ];
  return new ExtrudeGeometry(shapeFrom(points), { depth, bevelEnabled: false, curveSegments: 1 });
}

/**
 * A moulded band following an arch and its jambs down to `baseY`
 * (archivolt, door surround or vault rib).
 */
export function archBandGeometry(opts: {
  innerHalfWidth: number;
  spring: number;
  band: number;
  depth: number;
  baseY?: number;
  bevel?: number;
}): ExtrudeGeometry {
  const { innerHalfWidth: r, spring, band, depth, baseY = 0, bevel = 0 } = opts;
  const R = r + band;
  const inner = archPoints(r, spring).reverse();
  const points: [number, number][] = [[-R, baseY], ...archPoints(R, spring), [R, baseY], [r, baseY], ...inner, [-r, baseY]];
  const options: ExtrudeGeometryOptions = bevel
    ? { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 1 }
    : { depth, bevelEnabled: false, curveSegments: 1 };
  return new ExtrudeGeometry(shapeFrom(points), options);
}

/**
 * One door leaf with an arched head. The hinge edge sits at x = 0 and the leaf
 * extends toward +x (side = 1) or -x (side = -1) to the centre of the doorway.
 */
export function doorLeafGeometry(opts: { halfWidth: number; spring: number; thickness: number; side: 1 | -1; gap: number }): ExtrudeGeometry {
  const { halfWidth, spring, thickness, side, gap } = opts;
  const w = halfWidth - gap;
  const points: [number, number][] = [
    [0, 0],
    [side * w, 0],
  ];
  // Arc around the doorway centre (x = side * halfWidth) from the crown down to the hinge-side springing point.
  const r = halfWidth - gap;
  for (let i = 0; i <= ARC_SEGMENTS / 2; i++) {
    const a = Math.PI / 2 + (i / (ARC_SEGMENTS / 2)) * (Math.PI / 2);
    const x = side * halfWidth + side * Math.cos(a) * r;
    points.push([side > 0 ? Math.min(x, w) : Math.max(x, -w), spring + Math.sin(a) * r]);
  }
  points.push([0, spring]);
  return new ExtrudeGeometry(shapeFrom(points), { depth: thickness, bevelEnabled: false, curveSegments: 1 });
}

/**
 * The arched head panel of a door leaf: a raised panel whose top follows the
 * doorway arch, inset from the leaf edges. Leaf-local coordinates as in
 * doorLeafGeometry (hinge at x = 0, leaf toward `side`).
 */
export function doorHeadPanelGeometry(opts: {
  halfWidth: number;
  spring: number;
  side: 1 | -1;
  /** Margin from the hinge stile, the meeting stile and the arch. */
  inset: number;
  bottom: number;
  depth: number;
  bevel: number;
}): ExtrudeGeometry {
  const { halfWidth, spring, side, inset, bottom, depth, bevel } = opts;
  const r = halfWidth - inset - bevel;
  const hingeX = inset + bevel;
  const meetX = halfWidth - inset - bevel;
  // The top follows an arc concentric with the doorway arch (centre at x = halfWidth, y = spring).
  const arcY = (x: number) => spring + Math.sqrt(Math.max(0, r * r - (halfWidth - x) ** 2));
  const points: [number, number][] = [
    [side * hingeX, bottom + bevel],
    [side * meetX, bottom + bevel],
    [side * meetX, arcY(meetX)],
  ];
  const steps = ARC_SEGMENTS / 2;
  for (let i = 1; i < steps; i++) {
    const x = meetX - ((meetX - hingeX) * i) / steps;
    points.push([side * x, arcY(x)]);
  }
  points.push([side * hingeX, arcY(hingeX)]);
  return new ExtrudeGeometry(shapeFrom(points), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 1,
  });
}

/** A rectangle with softly bevelled edges, extruded toward +Z: raised door panels, plinths. */
export function bevelledPanelGeometry(width: number, height: number, depth: number, bevel: number): ExtrudeGeometry {
  const w = width / 2 - bevel;
  const h = height / 2 - bevel;
  const shape = shapeFrom([
    [-w, -h],
    [w, -h],
    [w, h],
    [-w, h],
  ]);
  return new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 1,
  });
}

/**
 * A rectangular ring (picture frame moulding). Inner opening is width x height;
 * the moulding is `band` wide and bevelled for a rounded profile.
 */
export function frameRingGeometry(
  width: number,
  height: number,
  band: number,
  depth: number,
  bevel: number,
  /** Shifts the opening up (positive) inside the ring, e.g. for a bottom-weighted mat. */
  holeOffsetY = 0,
): ExtrudeGeometry {
  const iw = width / 2 + bevel;
  const ih = height / 2 + bevel;
  const ow = width / 2 + band - bevel;
  const oh = height / 2 + band - bevel;
  const shape = shapeFrom([
    [-ow, -oh],
    [ow, -oh],
    [ow, oh],
    [-ow, oh],
  ]);
  const hole = shapeFrom([
    [-iw, -ih + holeOffsetY],
    [-iw, ih + holeOffsetY],
    [iw, ih + holeOffsetY],
    [iw, -ih + holeOffsetY],
  ]);
  shape.holes.push(hole);
  return new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 1,
  });
}

/** Rescales a geometry's UVs so a texture repeat of 1 maps to `metresPerRepeat` metres. */
export function scaleUVs(geometry: BufferGeometry, uScale: number, vScale: number): BufferGeometry {
  const uv = geometry.getAttribute("uv");
  if (!(uv instanceof BufferAttribute)) return geometry;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * uScale, uv.getY(i) * vScale);
  uv.needsUpdate = true;
  return geometry;
}

/**
 * A box whose UVs are in metres on every face, so a tiled material (dark
 * marble, stone) keeps the same scale on a 45 m skirting and a 0.5 m plinth.
 */
export function metricBox(width: number, height: number, depth: number): BoxGeometry {
  const g = new BoxGeometry(width, height, depth);
  const uv = g.getAttribute("uv");
  // BoxGeometry face order: +x, -x, +y, -y, +z, -z; 4 vertices each. [u extent, v extent] per face.
  const extents: [number, number][] = [
    [depth, height],
    [depth, height],
    [width, depth],
    [width, depth],
    [width, height],
    [width, height],
  ];
  for (let face = 0; face < 6; face++) {
    const [su, sv] = extents[face];
    for (let k = 0; k < 4; k++) {
      const i = face * 4 + k;
      uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    }
  }
  uv.needsUpdate = true;
  return g;
}

/**
 * A box with softly rounded edges. Real stone and timber are never knife-sharp:
 * a few millimetres of rounding catches a highlight along every edge, which is
 * much of what makes a moulding read as carved rather than computer-drawn.
 * One segment per edge keeps it to 108 triangles.
 */
export function bevelledBox(width: number, height: number, depth: number, radius = 0.015, { faceUVs = false } = {}): BufferGeometry {
  const r = Math.min(radius, Math.min(width, height, depth) / 2 - 1e-4);
  const geometry = new RoundedBoxGeometry(width, height, depth, 1, r);
  return faceUVs ? geometry : boxProjectUVs(geometry);
}

/**
 * Replaces a box-like geometry's UVs with metric ones projected along each
 * vertex's dominant normal axis, so a tiled stone or marble texture keeps the
 * same scale on a 10 cm block and on a 45 m cornice. (Per-face 0..1 UVs would
 * stretch it across every face.)
 */
export function boxProjectUVs<T extends BufferGeometry>(geometry: T): T {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const uv = geometry.getAttribute("uv");
  for (let i = 0; i < position.count; i++) {
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const nz = Math.abs(normal.getZ(i));
    const [u, v] =
      nx >= ny && nx >= nz
        ? [position.getZ(i), position.getY(i)]
        : ny >= nz
          ? [position.getX(i), position.getZ(i)]
          : [position.getX(i), position.getY(i)];
    uv.setXY(i, u, v);
  }
  uv.needsUpdate = true;
  return geometry;
}

/**
 * Bakes a soft vertical shading gradient into a geometry's vertex colours: the
 * bottom `ramp` metres darken toward `bottomShade` at the base, as a tall
 * element standing on the floor is shaded where it meets it. Use with a
 * material that has vertexColors enabled.
 */
export function withBaseShading<T extends BufferGeometry>(geometry: T, bottomShade: number, ramp: number): T {
  geometry.computeBoundingBox();
  const bottom = geometry.boundingBox?.min.y ?? 0;
  const position = geometry.getAttribute("position");
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const t = Math.min(1, Math.max(0, (position.getY(i) - bottom) / ramp));
    const shade = bottomShade + (1 - bottomShade) * t * t * (3 - 2 * t);
    colors.set([shade, shade, shade], i * 3);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}
