import { CanvasTexture, ClampToEdgeWrapping, NoColorSpace, type Texture } from "three";
import { galleryLayout } from "./galleryLayout";
import {
  CORRIDOR,
  DOORWAY,
  FACADE,
  INNER_FACADE,
  PAINTING_CENTER_HEIGHT,
  PORTICO,
  VAULT_RADIUS,
  BENCH_BAY,
  bayCenterZ,
  bayDividerZs,
} from "./layout";

/**
 * Baked light for the architecture. Real-time lights are expensive here (every
 * light adds to every lit pixel and to shader compile time), so the soft,
 * static part of the lighting is painted once into small canvas textures:
 *
 * - a light map (added to a surface's indirect light): pools from the picture
 *   lights, wall washes from hidden downlights, the cove light along the vault,
 *   daylight around the skylights, the glow around a lit doorway;
 * - an ambient-occlusion map (multiplies its indirect light): contact shadows
 *   where walls meet the floor, pilasters and cornices, and a dusk falloff
 *   across the outer facade.
 *
 * Both are low resolution, since they hold only soft gradients.
 */

type RGB = readonly [number, number, number];

// Interior light is a warm white rather than amber: the limestone's own ivory supplies the rest of the warmth,
// so its shadows stay a warm grey instead of turning orange-brown under the tone mapping.
const WARM: RGB = [1, 0.86, 0.68];
const SOFT_WARM: RGB = [1, 0.88, 0.75];
/** The lanterns and portico light outside, at dusk: deliberately more golden than the galleries. */
const DUSK_WARM: RGB = [1, 0.84, 0.64];
const DAYLIGHT: RGB = [0.93, 0.95, 0.98];
/** Faint ambient left in the corridor's shadows: 8-bit values chosen so they keep this hue (12, 11, 10). */
const INTERIOR_AMBIENT: RGB = [0.047, 0.043, 0.039];

/**
 * Paints light and occlusion onto a rectangle of surface measured in metres
 * (x across, y up), mapped to the texture's full 0..1 range.
 */
class SurfacePainter {
  private readonly light: CanvasRenderingContext2D;
  private readonly ao: CanvasRenderingContext2D;
  private readonly sx: number;
  private readonly sy: number;

  constructor(
    private readonly width: number,
    private readonly height: number,
    pixelsWide: number,
    pixelsHigh: number,
    base: RGB,
  ) {
    const make = () => {
      const canvas = document.createElement("canvas");
      canvas.width = pixelsWide;
      canvas.height = pixelsHigh;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("2D canvas is unavailable");
      return ctx;
    };
    this.light = make();
    this.ao = make();
    this.sx = pixelsWide / width;
    this.sy = pixelsHigh / height;
    this.light.fillStyle = rgba(base, 1);
    this.light.fillRect(0, 0, pixelsWide, pixelsHigh);
    this.light.globalCompositeOperation = "lighter";
    this.ao.fillStyle = "#ffffff";
    this.ao.fillRect(0, 0, pixelsWide, pixelsHigh);
    this.ao.globalCompositeOperation = "multiply";
  }

  private px(x: number) {
    return x * this.sx;
  }
  private py(y: number) {
    // Canvas textures are flipped on upload: the top canvas row is the top of the surface.
    return (this.height - y) * this.sy;
  }

  /** Adds an elliptical pool of light centred at (x, y) with radii (rx, ry) in metres. */
  pool(x: number, y: number, rx: number, ry: number, color: RGB, strength: number) {
    const ctx = this.light;
    ctx.save();
    ctx.translate(this.px(x), this.py(y));
    ctx.scale(rx * this.sx, ry * this.sy);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, rgba(color, strength));
    g.addColorStop(0.35, rgba(color, strength * 0.72));
    g.addColorStop(0.7, rgba(color, strength * 0.26));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  /** Adds light that is strongest along x = x0 and fades out by x1, over the y range [y0, y1]. */
  bandX(x0: number, x1: number, y0: number, y1: number, color: RGB, strength: number) {
    const ctx = this.light;
    const g = ctx.createLinearGradient(this.px(x0), 0, this.px(x1), 0);
    g.addColorStop(0, rgba(color, strength));
    g.addColorStop(0.4, rgba(color, strength * 0.45));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    this.fill(ctx, Math.min(x0, x1), Math.max(x0, x1), y0, y1);
  }

  /** Occlusion that is `factor` at x = x0 and fades to none by x1, over the y range [y0, y1]. */
  shadeX(x0: number, x1: number, factor: number, y0 = 0, y1 = this.height) {
    const ctx = this.ao;
    const g = ctx.createLinearGradient(this.px(x0), 0, this.px(x1), 0);
    g.addColorStop(0, grey(factor));
    g.addColorStop(0.45, grey(factor + (1 - factor) * 0.62));
    g.addColorStop(1, "#ffffff");
    ctx.fillStyle = g;
    this.fill(ctx, Math.min(x0, x1), Math.max(x0, x1), y0, y1);
  }

  /** Occlusion that is `factor` at y = y0 and fades to none by y1, over the x range [x0, x1]. */
  shadeY(y0: number, y1: number, factor: number, x0 = 0, x1 = this.width) {
    const ctx = this.ao;
    const g = ctx.createLinearGradient(0, this.py(y0), 0, this.py(y1));
    g.addColorStop(0, grey(factor));
    g.addColorStop(0.45, grey(factor + (1 - factor) * 0.62));
    g.addColorStop(1, "#ffffff");
    ctx.fillStyle = g;
    this.fill(ctx, x0, x1, Math.min(y0, y1), Math.max(y0, y1));
  }

  /** Symmetric occlusion strip around x = center: `factor` within `core`, fading out over `falloff`. */
  shadeAroundX(center: number, core: number, falloff: number, factor: number, y0 = 0, y1 = this.height) {
    this.fillAo(center - core, center + core, y0, y1, factor);
    this.shadeX(center - core, center - core - falloff, factor, y0, y1);
    this.shadeX(center + core, center + core + falloff, factor, y0, y1);
  }

  /** Soft round contact shadow (under a planter, a pedestal). */
  blob(x: number, y: number, rx: number, ry: number, factor: number) {
    const ctx = this.ao;
    ctx.save();
    ctx.translate(this.px(x), this.py(y));
    ctx.scale(rx * this.sx, ry * this.sy);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0, grey(factor));
    g.addColorStop(0.5, grey(factor + (1 - factor) * 0.45));
    g.addColorStop(1, "#ffffff");
    ctx.fillStyle = g;
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
  }

  fillAo(x0: number, x1: number, y0: number, y1: number, factor: number) {
    this.ao.fillStyle = grey(factor);
    this.fill(this.ao, x0, x1, y0, y1);
  }

  private fill(ctx: CanvasRenderingContext2D, x0: number, x1: number, y0: number, y1: number) {
    ctx.fillRect(this.px(x0), this.py(y1), this.px(x1) - this.px(x0), this.py(y0) - this.py(y1));
  }

  textures(): BakedLight {
    const finish = (ctx: CanvasRenderingContext2D) => {
      const t = new CanvasTexture(ctx.canvas);
      // Values are painted as linear intensities, so no colour-space decoding.
      t.colorSpace = NoColorSpace;
      t.wrapS = ClampToEdgeWrapping;
      t.wrapT = ClampToEdgeWrapping;
      return t;
    };
    const light = finish(this.light);
    const ao = finish(this.ao);
    return { light, ao, dispose: () => [light, ao].forEach((t) => t.dispose()) };
  }
}

function rgba([r, g, b]: RGB, a: number) {
  return `rgba(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)},${Math.min(1, Math.max(0, a))})`;
}

function grey(v: number) {
  const c = Math.round(Math.min(1, Math.max(0, v)) * 255);
  return `rgb(${c},${c},${c})`;
}

export interface BakedLight {
  light: Texture;
  ao: Texture;
  dispose(): void;
}

/**
 * Maps a baked texture onto geometry whose UVs are in metres: `u0`/`v0` are
 * the UV values (metres) at the texture's left and bottom edges.
 */
export function fitToMetres(texture: Texture, width: number, height: number, u0 = 0, v0 = 0): Texture {
  texture.repeat.set(1 / width, 1 / height);
  texture.offset.set(-u0 / width, -v0 / height);
  return texture;
}

const W = CORRIDOR.halfWidth;
const H = CORRIDOR.wallHeight;
export const CORRIDOR_LENGTH = CORRIDOR.startZ - CORRIDOR.endZ;
const DIVIDERS = bayDividerZs();
/** Pilaster shafts project this far along the wall either side of a divider. */
const PILASTER_HALF = 0.31;
const SKIRTING_TOP = 0.46;

/** The recessed panels framed by mouldings in every bay (see GalleryCorridor), for their contact shadows. */
export interface WallPanels {
  /** Length of each panel along the wall, centred on its bay. */
  length: number;
  /** Width of the moulding band. */
  band: number;
  /** Bottom and top of each panel (the rails' centre lines). */
  spans: readonly (readonly [number, number])[];
}

/**
 * One corridor wall. The wall plane's u runs from the entrance end on the left
 * wall (x < 0) and from the far end on the right wall, as seen from inside.
 */
export function bakeCorridorWall(side: -1 | 1, panels: WallPanels): BakedLight {
  const u = (z: number) => (side < 0 ? CORRIDOR.startZ - z : z - CORRIDOR.endZ);
  // 59 px per metre up the wall: enough for the few-centimetre contact shadows under the mouldings.
  const p = new SurfacePainter(CORRIDOR_LENGTH, H, 2048, 384, INTERIOR_AMBIENT);
  for (let bay = 0; bay < CORRIDOR.bayCount; bay++) {
    const z = bayCenterZ(bay);
    const painting = galleryLayout.find((l) => l.bay === bay && l.side === side);
    if (painting) {
      // The picture light's pool: a soft field around the frame, brightest just above its centre, and a tighter
      // core, so the light gathers on the painting and falls away across the panel rather than flooding the bay.
      const { outerWidth, outerHeight } = painting.frame;
      p.pool(u(z), PAINTING_CENTER_HEIGHT + 0.35, outerWidth / 2 + 1.25, outerHeight / 2 + 1.1, WARM, 0.6);
      p.pool(u(z), PAINTING_CENTER_HEIGHT + 0.15, outerWidth / 2 + 0.45, outerHeight / 2 + 0.4, WARM, 0.36);
    } else {
      // A wall washer hidden in the cornice: a scallop of light fanning down from the top of the wall.
      p.pool(u(z), H + 0.4, 1.6, 4.4, SOFT_WARM, 0.7);
    }
  }
  // Each pilaster is grazed by the cove light along its length.
  for (const z of DIVIDERS) p.pool(u(z), H - 0.6, 1.0, 2.6, SOFT_WARM, 0.18);

  // Contact shadows: floor, cornice overhang, pilasters, and the corridor's end walls.
  p.shadeY(SKIRTING_TOP, 1.5, 0.44);
  p.shadeY(H, H - 1.2, 0.55);
  // The panel mouldings: light comes from above, so each rail casts a short soft shadow on the wall below it,
  // and each stile a fainter one either side.
  for (let bay = 0; bay < CORRIDOR.bayCount; bay++) {
    const a = u(bayCenterZ(bay) - panels.length / 2);
    const b = u(bayCenterZ(bay) + panels.length / 2);
    const [from, to] = [Math.min(a, b), Math.max(a, b)];
    for (const [bottom, top] of panels.spans) {
      for (const rail of [bottom, top]) p.shadeY(rail - panels.band / 2, rail - panels.band / 2 - 0.09, 0.62, from, to);
      for (const edge of [from, to]) {
        p.shadeX(edge, edge - 0.05, 0.8, bottom, top);
        p.shadeX(edge, edge + 0.05, 0.8, bottom, top);
      }
    }
  }
  for (const z of DIVIDERS) p.shadeAroundX(u(z), PILASTER_HALF, 0.75, 0.66);
  // u grows into the corridor from the entrance end on the left wall, and from the far end on the right.
  p.shadeX(u(CORRIDOR.startZ), u(CORRIDOR.startZ) - side * 1.6, 0.5);
  p.shadeX(u(CORRIDOR.endZ), u(CORRIDOR.endZ) + side * 1.6, 0.55);
  return p.textures();
}

/** The glazed opening at the crown of each bay, in vault metres. */
export interface VaultSkylight {
  /** Half the skylight's width, measured around the arc. */
  halfArc: number;
  length: number;
}

const VAULT_ARC = Math.PI * VAULT_RADIUS;
const vaultV = (z: number) => z - CORRIDOR.endZ;

/**
 * Coffers either side of each bay's skylight, as [u0, u1, v0, v1] in vault
 * metres: three rows up the curve of the vault and four along the bay, between
 * the transverse ribs.
 */
function vaultCoffers(skylight: VaultSkylight): [number, number, number, number][] {
  const gap = 0.2;
  const rows = 3;
  const cols = 4;
  // From just above the cornice crown (which hides the lowest part of the vault) to the skylight frame.
  const uStart = 0.95;
  const uEnd = VAULT_ARC / 2 - skylight.halfArc - 0.34;
  const rowH = (uEnd - uStart - gap * (rows - 1)) / rows;
  const coffers: [number, number, number, number][] = [];
  for (let bay = 0; bay < CORRIDOR.bayCount; bay++) {
    const vNear = vaultV(DIVIDERS[bay]) - 0.25 - gap;
    const vFar = vaultV(DIVIDERS[bay + 1]) + 0.25 + gap;
    const colW = (vNear - vFar - gap * (cols - 1)) / cols;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const u0 = uStart + r * (rowH + gap);
        const v0 = vFar + c * (colW + gap);
        coffers.push([u0, u0 + rowH, v0, v0 + colW], [VAULT_ARC - u0 - rowH, VAULT_ARC - u0, v0, v0 + colW]);
      }
    }
  }
  return coffers;
}

/**
 * Relief (bump map) of the coffered vault: each coffer is a stepped recess
 * with a small raised rosette at its centre. Mapped 1:1 onto the vault.
 */
export function bakeVaultRelief(skylight: VaultSkylight): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 2048;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  const sx = canvas.width / VAULT_ARC;
  const sy = canvas.height / CORRIDOR_LENGTH;
  const rect = (u0: number, u1: number, v0: number, v1: number, inset: number, level: number) => {
    ctx.fillStyle = grey(level);
    ctx.fillRect((u0 + inset) * sx, (CORRIDOR_LENGTH - v1 + inset) * sy, (u1 - u0 - inset * 2) * sx, (v1 - v0 - inset * 2) * sy);
  };
  ctx.fillStyle = grey(0.7);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const [u0, u1, v0, v1] of vaultCoffers(skylight)) {
    rect(u0, u1, v0, v1, 0, 0.5);
    rect(u0, u1, v0, v1, 0.06, 0.36);
    rect(u0, u1, v0, v1, 0.13, 0.28);
    ctx.fillStyle = grey(0.62);
    ctx.beginPath();
    ctx.ellipse(((u0 + u1) / 2) * sx, (CORRIDOR_LENGTH - (v0 + v1) / 2) * sy, 0.15 * sx, 0.15 * sy, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = NoColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/**
 * The barrel vault. u runs around the arc from the right springing line
 * (u = 0) over the crown to the left (u = pi R); v runs along the corridor
 * from the far end.
 */
export function bakeVault(skylightZs: readonly number[], skylight: VaultSkylight): BakedLight {
  const arc = VAULT_ARC;
  const v = vaultV;
  const p = new SurfacePainter(arc, CORRIDOR_LENGTH, 256, 1024, [0.059, 0.055, 0.051]);
  // Cove light hidden on top of the cornice, washing up the lower vault from both sides.
  p.bandX(0, 3.4, 0, CORRIDOR_LENGTH, SOFT_WARM, 0.7);
  p.bandX(arc, arc - 3.4, 0, CORRIDOR_LENGTH, SOFT_WARM, 0.7);
  // Daylight from each skylight spreading over the surrounding vault.
  for (const z of skylightZs) {
    p.pool(arc / 2, v(z), 3.4, 3.9, DAYLIGHT, 0.5);
    p.pool(arc / 2, v(z), 2.2, 2.8, DAYLIGHT, 0.22);
  }
  // Shadow either side of each transverse rib, and toward both ends of the vault.
  for (const z of DIVIDERS) {
    const rib = v(z);
    p.shadeY(rib - 0.25, rib - 1.3, 0.7);
    p.shadeY(rib + 0.25, rib + 1.3, 0.7);
  }
  p.shadeY(v(CORRIDOR.startZ), v(CORRIDOR.startZ) - 2, 0.55);
  p.shadeY(v(CORRIDOR.endZ), v(CORRIDOR.endZ) + 2, 0.6);
  // The coffers' recesses hold a little shadow.
  for (const [u0, u1, v0, v1] of vaultCoffers(skylight)) {
    p.fillAo(u0, u1, v0, v1, 0.74);
    p.fillAo(u0 + 0.13, u1 - 0.13, v0 + 0.13, v1 - 0.13, 0.86);
  }
  return p.textures();
}

/** The end wall around the final archway; x is measured from the left corridor wall. */
export function bakeEndWall(arch: { halfWidth: number; spring: number }, height: number): BakedLight {
  const p = new SurfacePainter(W * 2, height, 256, 300, [0.067, 0.063, 0.057]);
  // Warm light from the lit apse beyond spills round the archway, so the end of the walk glows.
  p.pool(W, arch.spring + 0.4, arch.halfWidth + 2.4, arch.spring + 1.6, WARM, 0.62);
  // Wall washers either side of the arch, and daylight from the lunette window above the cornice.
  for (const x of [W - arch.halfWidth - 1.9, W + arch.halfWidth + 1.9]) p.pool(x, H + 0.3, 1.2, 3.6, SOFT_WARM, 0.3);
  p.pool(W, H + 1.4, 3.8, 2.4, DAYLIGHT, 0.35);
  p.shadeY(SKIRTING_TOP, 1.5, 0.5);
  p.shadeY(H - 0.5, H - 1.5, 0.7);
  p.shadeX(0, 1.4, 0.55);
  p.shadeX(W * 2, W * 2 - 1.4, 0.55);
  p.shadeY(height, height - 2.5, 0.6);
  return p.textures();
}

/** Outer facade around the great arch; x is measured from its left edge. */
export function bakeFacade(pilasterXs: readonly number[]): BakedLight {
  const w = FACADE.width;
  const h = FACADE.height;
  const cx = w / 2;
  const p = new SurfacePainter(w, h, 512, 256, [0.015, 0.013, 0.01]);
  // The lit portico glows out through the great arch onto the surrounding stone.
  p.pool(cx, FACADE.archSpring + 1, FACADE.archHalfWidth + 3.2, FACADE.archSpring + 2.8, DUSK_WARM, 0.3);
  // Uplights at the foot of the wall between the pilasters: narrow scallops fading up the facade.
  const bays = [...pilasterXs, -w / 2 + 0.6, w / 2 - 0.6].sort((a, b) => a - b);
  for (let i = 0; i < bays.length - 1; i++) {
    const mid = (bays[i] + bays[i + 1]) / 2;
    if (Math.abs(mid) < FACADE.archHalfWidth + 1) continue;
    p.pool(cx + mid, 0, 1.1, 5.2, DUSK_WARM, 0.34);
  }
  // Dusk: beyond the archivolt the facade falls into shadow, toward the sides and up toward the cornice.
  const edge = FACADE.archHalfWidth + 0.9;
  p.shadeX(cx - edge - 5.5, cx - edge, 0.3);
  p.shadeX(cx + edge + 5.5, cx + edge, 0.3);
  p.fillAo(0, cx - edge - 5.5, 0, h, 0.3);
  p.fillAo(cx + edge + 5.5, w, 0, h, 0.3);
  p.shadeY(h, FACADE.archSpring + 2, 0.4);
  p.shadeY(0.55, 1.6, 0.55);
  return p.textures();
}

/** The inner facade holding the doors, inside the portico; x is measured from its left edge. */
export function bakeInnerFacade(lanternX: number, lanternY: number): BakedLight {
  const w = INNER_FACADE.halfWidth * 2;
  const h = INNER_FACADE.height;
  const cx = w / 2;
  const p = new SurfacePainter(w, h, 256, 256, [0.05, 0.044, 0.035]);
  // A concentrated amber glow on the stone around each lantern, and a softer, wider one.
  for (const side of [-1, 1]) {
    p.pool(cx + side * lanternX, lanternY + 0.1, 0.9, 1.2, [1, 0.72, 0.42], 0.9);
    p.pool(cx + side * lanternX, lanternY + 0.3, 1.8, 2.3, DUSK_WARM, 0.35);
  }
  // The downlight over the doors: a broad pool on the lunette and the inscription.
  p.pool(cx, DOORWAY.spring + 3.4, 3.2, 3.2, DUSK_WARM, 0.32);
  p.shadeY(0.32, 1.4, 0.55);
  p.shadeX(cx - FACADE.archHalfWidth, cx - FACADE.archHalfWidth + 1.1, 0.5);
  p.shadeX(cx + FACADE.archHalfWidth, cx + FACADE.archHalfWidth - 1.1, 0.5);
  p.shadeY(FACADE.archSpring + FACADE.archHalfWidth, FACADE.archSpring + 1.5, 0.55);
  return p.textures();
}

/**
 * Contact shadows on the marble floor, which runs from the forecourt
 * (z = nearZ) to beyond the end wall (z = farZ). Painted x is measured from the
 * floor's left edge and y from its near edge.
 */
export function bakeFloor(width: number, nearZ: number, farZ: number, planters: readonly [number, number][]): Texture {
  const length = nearZ - farZ;
  const hw = width / 2;
  const p = new SurfacePainter(width, length, 512, 1536, [0, 0, 0]);
  const y = (z: number) => nearZ - z;
  const x = (wx: number) => wx + hw;
  // Along both corridor walls.
  // The border inlay covers the first 0.7 m from each wall; the shadow fades out across the pale marble beyond it.
  for (const side of [-1, 1]) p.shadeX(x(side * (W - 0.6)), x(side * (W - 1.7)), 0.6, y(CORRIDOR.startZ), y(CORRIDOR.endZ));
  // Against the end wall, the inner facade and the porch walls.
  p.shadeY(y(CORRIDOR.endZ), y(CORRIDOR.endZ) - 1.4, 0.5, x(-W), x(W));
  p.shadeY(y(0), y(0) - 1.2, 0.55, x(-FACADE.archHalfWidth), x(FACADE.archHalfWidth));
  p.shadeY(y(CORRIDOR.startZ), y(CORRIDOR.startZ) + 1.2, 0.55, x(-W), x(W));
  for (const side of [-1, 1]) {
    p.shadeX(x(side * FACADE.archHalfWidth), x(side * (FACADE.archHalfWidth - 0.9)), 0.5, y(PORTICO.depth), y(0));
  }
  // In front of the outer facade, either side of the portico, and a dusk falloff across the forecourt.
  for (const side of [-1, 1]) {
    p.shadeY(y(PORTICO.depth), y(PORTICO.depth) - 1.6, 0.5, side < 0 ? 0 : x(FACADE.archHalfWidth + 0.6), side < 0 ? x(-FACADE.archHalfWidth - 0.6) : width);
  }
  p.shadeX(0, hw * 0.55, 0.45, 0, y(PORTICO.depth));
  p.shadeX(width, width - hw * 0.55, 0.45, 0, y(PORTICO.depth));
  p.shadeY(0, length * 0.18, 0.55, 0, width);
  for (const [px, pz] of planters) p.blob(x(px), y(pz), 0.75, 0.75, 0.5);
  // Under the bench.
  p.blob(x(0), y(bayCenterZ(BENCH_BAY)), 0.9, 1.9, 0.55);
  const baked = p.textures();
  baked.light.dispose();
  return baked.ao;
}
