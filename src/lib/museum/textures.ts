import { CanvasTexture, DataTexture, RepeatWrapping, SRGBColorSpace, NoColorSpace } from "three";

/**
 * Procedurally painted surface textures. Generated once on the client from a
 * seeded random source, so the museum needs no texture downloads and every
 * visit looks identical.
 */

function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  return [canvas, ctx];
}

function toTexture(canvas: HTMLCanvasElement, color: boolean, anisotropy = 4): CanvasTexture {
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.colorSpace = color ? SRGBColorSpace : NoColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

/** Fine mottling shared by plaster and stone. */
function speckle(ctx: CanvasRenderingContext2D, size: number, rand: () => number, count: number, alpha: number) {
  for (let i = 0; i < count; i++) {
    const shade = rand() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${shade},${shade},${shade},${rand() * alpha})`;
    const r = rand() * 2.2 + 0.4;
    ctx.fillRect(rand() * size, rand() * size, r, r);
  }
}

/**
 * One kentia palm frond, drawn with transparency: a bare stalk at the base, then
 * a midrib carrying long, slender leaflets that sweep toward the tip. The tip is
 * at the top of the canvas. The leaflets' droop comes from the frond geometry
 * (see Planter), which folds the frond into a shallow V along its midrib.
 */
let frondCache: CanvasTexture | null = null;
export function getFrondTexture(): CanvasTexture {
  if (frondCache) return frondCache;
  const w = 256;
  const h = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  const rand = seededRandom(11);
  const cx = w / 2;
  /** Leaflets run from 20% of the length (above the bare stalk) to the tip. */
  const firstLeaflet = 0.8 * h;
  const tip = 0.02 * h;

  // Leaflets first, so the midrib is drawn over their bases.
  for (let y = firstLeaflet; y > tip; y -= 15 + rand() * 4) {
    const t = (firstLeaflet - y) / (firstLeaflet - tip);
    const reach = Math.pow(Math.sin(Math.PI * (0.12 + 0.82 * t)), 0.6) * (w * 0.47) + 10;
    for (const side of [-1, 1]) {
      const length = reach * (0.86 + rand() * 0.2);
      // Leaflets sweep forward (toward the tip) more steeply near the tip.
      const angle = (0.62 + 0.35 * t + (rand() - 0.5) * 0.12) * (Math.PI / 2);
      const ex = cx + side * Math.cos(Math.PI / 2 - angle) * length;
      const ey = y - Math.sin(Math.PI / 2 - angle) * length * 0.55 - length * 0.35;
      const width = 4 + (1 - Math.abs(t - 0.45)) * 4;
      const g = 64 + Math.floor(rand() * 34);
      ctx.fillStyle = `rgb(${26 + Math.floor(rand() * 18)}, ${g}, ${26 + Math.floor(rand() * 14)})`;
      // A slender lanceolate leaflet: widest a third of the way along, tapering to a point.
      const mx = cx + (ex - cx) * 0.35;
      const my = y + (ey - y) * 0.35;
      const nx = -(ey - y) / length;
      const ny = (ex - cx) / length;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.quadraticCurveTo(mx + nx * width, my + ny * width, ex, ey);
      ctx.quadraticCurveTo(mx - nx * width, my - ny * width, cx, y + 3);
      ctx.fill();
      // Paler midvein along each leaflet.
      ctx.strokeStyle = "rgba(150, 175, 100, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }
  }
  // Stalk and midrib, tapering toward the tip.
  for (let y = h; y > tip; y -= 4) {
    const t = (h - y) / (h - tip);
    ctx.fillStyle = `rgb(${70 - t * 20}, ${86 - t * 10}, ${44 - t * 8})`;
    const half = 3.4 - t * 2.4;
    ctx.fillRect(cx - half, y - 4, half * 2, 5);
  }
  frondCache = new CanvasTexture(canvas);
  frondCache.colorSpace = SRGBColorSpace;
  frondCache.anisotropy = 4;
  return frondCache;
}

/**
 * Stand-in canvas shown when a painting's image fails to load: plain primed
 * canvas with a clear "image unavailable" label, so it is never mistaken for art.
 */
export function createUnavailableTexture(title: string, aspect: number): CanvasTexture {
  const height = 1024;
  const width = Math.round(height * aspect);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  ctx.fillStyle = "#e6dfd2";
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = "rgba(90,70,50,0.35)";
  ctx.lineWidth = 3;
  ctx.strokeRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);
  ctx.textAlign = "center";
  ctx.fillStyle = "#5c4a38";
  ctx.font = `500 ${Math.round(width * 0.075)}px Georgia, "Times New Roman", serif`;
  ctx.fillText(title, width / 2, height * 0.47, width * 0.76);
  ctx.fillStyle = "#857260";
  ctx.font = `${Math.round(width * 0.045)}px Arial, Helvetica, sans-serif`;
  ctx.fillText("Image unavailable", width / 2, height * 0.55, width * 0.76);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/**
 * Glazing for the vault skylights: clear sky divided into panes by slim
 * ivory-painted glazing bars.
 */
let skylightCache: CanvasTexture | null = null;
export function getSkylightTexture(): CanvasTexture {
  if (skylightCache) return skylightCache;
  const w = 256;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  // Daylight through the glass: pale sky, brighter toward the centre of each pane run.
  const sky = ctx.createLinearGradient(0, 0, w, 0);
  sky.addColorStop(0, "#6f9ccb");
  sky.addColorStop(0.5, "#a9c8e6");
  sky.addColorStop(1, "#6f9ccb");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);
  const haze = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, h * 0.6);
  haze.addColorStop(0, "rgba(255,252,244,0.3)");
  haze.addColorStop(1, "rgba(255,252,244,0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, w, h);
  // Slim ivory-painted glazing bars: four lights across, six along.
  ctx.fillStyle = "rgba(236,228,212,0.95)";
  const cols = 4;
  const rows = 6;
  for (let i = 1; i < cols; i++) ctx.fillRect((w * i) / cols - 4, 0, 8, h);
  for (let j = 1; j < rows; j++) ctx.fillRect(0, (h * j) / rows - 3.5, w, 7);
  skylightCache = new CanvasTexture(canvas);
  skylightCache.colorSpace = SRGBColorSpace;
  skylightCache.anisotropy = 4;
  return skylightCache;
}

export interface InscriptionTextures {
  /** Stone with gilded lettering. */
  map: CanvasTexture;
  /** Green: roughness factor, blue: metalness (gilt letters are smoother and metallic). */
  surface: CanvasTexture;
  /** Letters dark: carved into the stone. */
  bump: CanvasTexture;
  /** Re-letters the same canvases in another font (e.g. once the web font has loaded). */
  redraw(fontFamily: string): void;
  dispose(): void;
}

/** Canvas size of the inscription tablet; its aspect matches the tablet in the scene. */
export const INSCRIPTION_CANVAS = { width: 2048, height: 816 } as const;

/**
 * Lettering for the carved inscription above the doors. The textures exist
 * from the first frame (drawn in a fallback serif) so the tablet's material is
 * compiled with the rest of the scene; `redraw` swaps in the display face
 * (Cinzel) without creating new textures or materials.
 */
export function createInscriptionTextures(fontFamily: string): InscriptionTextures {
  const { width: w, height: h } = INSCRIPTION_CANVAS;
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas is unavailable");
    return [canvas, ctx] as const;
  };
  const lines = [
    { text: "ARVISTA", size: 330, tracking: 0.16, y: 0.47 },
    { text: "THE ART GALLERY", size: 112, tracking: 0.42, y: 0.8 },
  ];
  const [mapCanvas, map] = make();
  const [surfaceCanvas, surface] = make();
  const [bumpCanvas, bump] = make();

  const draw = (family: string) => {
    /** Draws each line letter by letter so tracking works in every browser. */
    const drawText = (ctx: CanvasRenderingContext2D, fill: (ctx: CanvasRenderingContext2D, size: number, y: number) => void) => {
      for (const line of lines) {
        ctx.font = `400 ${line.size}px ${family}`;
        ctx.textBaseline = "alphabetic";
        const chars = [...line.text];
        const advances = chars.map((c) => ctx.measureText(c).width + line.size * line.tracking);
        const total = advances.reduce((a, b) => a + b, 0) - line.size * line.tracking;
        let x = (w - total) / 2;
        const y = h * line.y;
        fill(ctx, line.size, y);
        chars.forEach((c, i) => {
          ctx.fillText(c, x, y);
          x += advances[i];
        });
      }
      // Incised rule between the two lines.
      ctx.fillRect(w * 0.43, h * 0.6, w * 0.14, 5);
    };

    map.fillStyle = "#efe6d6";
    map.fillRect(0, 0, w, h);
    speckle(map, w, seededRandom(91), 9000, 0.04);
    // A darker lip on the upper inside edge reads as the shadowed wall of a V-cut letter.
    drawText(map, (ctx) => {
      ctx.fillStyle = "#5e4a33";
    });
    map.save();
    map.translate(0, 3);
    drawText(map, (ctx, size, y) => {
      const g = ctx.createLinearGradient(0, y - size * 0.75, 0, y);
      g.addColorStop(0, "#bf9c5d");
      g.addColorStop(0.5, "#a17d43");
      g.addColorStop(1, "#c8a96b");
      ctx.fillStyle = g;
    });
    map.restore();

    surface.fillStyle = "rgb(0,255,0)";
    surface.fillRect(0, 0, w, h);
    drawText(surface, (ctx) => {
      ctx.fillStyle = "rgb(0,120,255)";
    });

    bump.filter = "none";
    bump.fillStyle = "#ffffff";
    bump.fillRect(0, 0, w, h);
    bump.filter = "blur(2px)";
    drawText(bump, (ctx) => {
      ctx.fillStyle = "#000000";
    });
  };
  draw(fontFamily);

  const finish = (canvas: HTMLCanvasElement, color: boolean) => {
    const t = new CanvasTexture(canvas);
    t.colorSpace = color ? SRGBColorSpace : NoColorSpace;
    t.anisotropy = 8;
    return t;
  };
  const textures = {
    map: finish(mapCanvas, true),
    surface: finish(surfaceCanvas, false),
    bump: finish(bumpCanvas, false),
  };
  return {
    ...textures,
    redraw(family: string) {
      draw(family);
      Object.values(textures).forEach((t) => (t.needsUpdate = true));
    },
    dispose: () => Object.values(textures).forEach((t) => t.dispose()),
  };
}

/**
 * Soft rectangular shadow (alpha in the red channel) placed on the wall behind
 * each frame. A static stand-in for a shadow map: the picture lights are fixed,
 * so the frame's drop shadow never changes.
 */
let softShadowCache: CanvasTexture | null = null;
export function getSoftShadowTexture(): CanvasTexture {
  if (softShadowCache) return softShadowCache;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  // shadowBlur works in every browser (unlike ctx.filter); the rectangle itself is drawn off-canvas.
  ctx.shadowColor = "#fff";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetX = size * 4;
  ctx.fillStyle = "#fff";
  const inset = 34;
  ctx.fillRect(inset - size * 4, inset, size - inset * 2, size - inset * 2);
  softShadowCache = new CanvasTexture(canvas);
  return softShadowCache;
}

export interface DetailTextures {
  /** Vertical fluting relief for pilaster shafts (bump map). */
  flutes: CanvasTexture;
  /** Fine linen weave for picture mats. */
  linen: CanvasTexture;
}

let detailCache: DetailTextures | null = null;

/** Small tileable textures for architectural details; each is a few cheap canvas draws. */
export function getDetailTextures(): DetailTextures {
  if (detailCache) return detailCache;

  const rand = seededRandom(73);

  // Fluting: five rounded channels across the texture width, as a height map.
  const [fluteCanvas, flute] = makeCanvas(256);
  const channels = 5;
  const g = flute.createLinearGradient(0, 0, 256 / channels, 0);
  g.addColorStop(0, "#ffffff");
  g.addColorStop(0.12, "#ffffff");
  g.addColorStop(0.5, "#1a1a1a");
  g.addColorStop(0.88, "#ffffff");
  g.addColorStop(1, "#ffffff");
  flute.fillStyle = g;
  for (let i = 0; i < channels; i++) {
    flute.save();
    flute.translate((256 / channels) * i, 0);
    flute.fillRect(0, 0, 256 / channels, 256);
    flute.restore();
  }

  // Linen: a faint woven cross-hatch on ivory.
  const [linenCanvas, linen] = makeCanvas(256);
  linen.fillStyle = "#ece5d6";
  linen.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 2) {
    linen.fillStyle = `rgba(120,100,70,${0.035 + rand() * 0.04})`;
    linen.fillRect(i, 0, 1, 256);
    linen.fillStyle = `rgba(255,255,250,${0.04 + rand() * 0.05})`;
    linen.fillRect(0, i, 256, 1);
  }
  speckle(linen, 256, rand, 2500, 0.05);

  const flutes = toTexture(fluteCanvas, false);
  flutes.wrapT = RepeatWrapping;
  detailCache = { flutes, linen: toTexture(linenCanvas, true, 8) };
  return detailCache;
}

/** 1 x 1 primed-canvas colour shown on a painting's surface while its image loads. */
let primedCache: DataTexture | null = null;
export function getPrimedCanvasTexture(): DataTexture {
  if (primedCache) return primedCache;
  primedCache = new DataTexture(new Uint8Array([228, 220, 205, 255]), 1, 1);
  primedCache.colorSpace = SRGBColorSpace;
  primedCache.needsUpdate = true;
  return primedCache;
}

/** Soft round glow for lamp halos (drawn additively, tinted by the material colour). */
let glowCache: CanvasTexture | null = null;
export function getGlowTexture(): CanvasTexture {
  if (glowCache) return glowCache;
  const size = 128;
  const [canvas, ctx] = makeCanvas(size);
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.12, "rgba(255,255,255,0.8)");
  g.addColorStop(0.35, "rgba(255,255,255,0.3)");
  g.addColorStop(0.65, "rgba(255,255,255,0.08)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glowCache = new CanvasTexture(canvas);
  glowCache.colorSpace = SRGBColorSpace;
  return glowCache;
}

export interface NicheTextures {
  /** Half-cylinder wall of the apse: u around the curve (0.5 = back), v up. */
  wall: CanvasTexture;
  /** Half-dome: brightest at its crown, as if lit from an oculus. */
  dome: CanvasTexture;
  /** Side walls of the short vestibule in front of the apse, brightening toward it (u = 1). */
  side: CanvasTexture;
  dispose(): void;
}

/**
 * Baked lighting for the apse seen through the final archway. It is only ever
 * seen from a distance, so its limestone is shaded into the texture (a warm
 * light from above, falling off to the sides and the floor), with its impost
 * moulding and baseboard painted in, and drawn unlit.
 */
export function createNicheTextures(): NicheTextures {
  const grain = (ctx: CanvasRenderingContext2D, w: number, h: number, seed: number) => {
    const rand = seededRandom(seed);
    for (let i = 0; i < (w * h) / 40; i++) {
      ctx.fillStyle = rand() > 0.5 ? `rgba(255,250,240,${rand() * 0.05})` : `rgba(90,70,50,${rand() * 0.05})`;
      ctx.fillRect(rand() * w, rand() * h, 1.2, 1.2);
    }
  };
  const canvas = (w: number, h: number) => {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("2D canvas is unavailable");
    return [c, ctx] as const;
  };

  // The apse wall is 4.4 m high: 58 px per metre.
  const [wallCanvas, wall] = canvas(256, 256);
  // Ivory limestone lit from a hidden opening above: brightest under the dome, a warm grey toward the floor.
  const vertical = wall.createLinearGradient(0, 0, 0, 256);
  vertical.addColorStop(0, "#f0dcbc");
  vertical.addColorStop(0.45, "#d9bf98");
  vertical.addColorStop(1, "#8f765a");
  wall.fillStyle = vertical;
  wall.fillRect(0, 0, 256, 256);
  const sides = wall.createLinearGradient(0, 0, 256, 0);
  sides.addColorStop(0, "rgba(62,48,34,0.62)");
  sides.addColorStop(0.3, "rgba(62,48,34,0)");
  sides.addColorStop(0.7, "rgba(62,48,34,0)");
  sides.addColorStop(1, "rgba(62,48,34,0.62)");
  wall.fillStyle = sides;
  wall.fillRect(0, 0, 256, 256);
  // A downlight's pool on the back of the niche, behind the palm.
  const pool = wall.createRadialGradient(128, 64, 4, 128, 92, 124);
  pool.addColorStop(0, "rgba(255,246,226,0.7)");
  pool.addColorStop(0.5, "rgba(255,238,212,0.24)");
  pool.addColorStop(1, "rgba(255,240,218,0)");
  wall.fillStyle = pool;
  wall.fillRect(0, 0, 256, 256);
  // Impost moulding where the dome springs: a lit upper edge over a soft shadow line.
  wall.fillStyle = "rgba(255,250,238,0.45)";
  wall.fillRect(0, 2, 256, 3);
  const impost = wall.createLinearGradient(0, 5, 0, 13);
  impost.addColorStop(0, "rgba(70,52,36,0.32)");
  impost.addColorStop(1, "rgba(70,52,36,0)");
  wall.fillStyle = impost;
  wall.fillRect(0, 5, 256, 8);
  // Dark marble baseboard with a limestone cap, as along the corridor (0.42 m).
  wall.fillStyle = "#3a3632";
  wall.fillRect(0, 232, 256, 24);
  wall.fillStyle = "rgba(240,228,206,0.75)";
  wall.fillRect(0, 229, 256, 3);
  grain(wall, 256, 256, 401);

  const [domeCanvas, dome] = canvas(256, 128);
  const crown = dome.createLinearGradient(0, 0, 0, 128);
  crown.addColorStop(0, "#f8ead0");
  crown.addColorStop(1, "#e2c9a2");
  dome.fillStyle = crown;
  dome.fillRect(0, 0, 256, 128);
  dome.fillStyle = sides;
  dome.fillRect(0, 0, 256, 128);
  grain(dome, 256, 128, 402);

  const [sideCanvas, side] = canvas(256, 128);
  const toward = side.createLinearGradient(0, 0, 256, 0);
  toward.addColorStop(0, "#584838");
  toward.addColorStop(1, "#c4a985");
  side.fillStyle = toward;
  side.fillRect(0, 0, 256, 128);
  const floorShade = side.createLinearGradient(0, 0, 0, 128);
  floorShade.addColorStop(0, "rgba(255,244,226,0.12)");
  floorShade.addColorStop(1, "rgba(44,34,24,0.3)");
  side.fillStyle = floorShade;
  side.fillRect(0, 0, 256, 128);
  grain(side, 256, 128, 403);

  const finish = (c: HTMLCanvasElement) => {
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
  };
  const textures = { wall: finish(wallCanvas), dome: finish(domeCanvas), side: finish(sideCanvas) };
  return { ...textures, dispose: () => Object.values(textures).forEach((t) => t.dispose()) };
}
