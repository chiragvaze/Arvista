import { CanvasTexture, DataTexture, RepeatWrapping, SRGBColorSpace, NoColorSpace, type Texture } from "three";

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

/** Smooth 2D value noise with fractal octaves, deterministic per seed. Optionally periodic (tileable). */
function createNoise(seed: number, period = 0) {
  const rand = seededRandom(seed);
  const N = 256;
  const lattice = new Float32Array(N * N);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
  const fade = (t: number) => t * t * (3 - 2 * t);
  const at = (x: number, y: number) => lattice[(((y % N) + N) % N) * N + (((x % N) + N) % N)];
  const value = (x: number, y: number, p: number) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = fade(x - x0);
    const fy = fade(y - y0);
    const wrap = (v: number) => (p ? ((v % p) + p) % p : v);
    const a = at(wrap(x0), wrap(y0));
    const b = at(wrap(x0 + 1), wrap(y0));
    const c = at(wrap(x0), wrap(y0 + 1));
    const d = at(wrap(x0 + 1), wrap(y0 + 1));
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  };
  /** Fractal noise in [0, 1]; x and y in lattice cells. */
  return (x: number, y: number, octaves = 4) => {
    let sum = 0;
    let amp = 0.5;
    let norm = 0;
    let freq = 1;
    for (let o = 0; o < octaves; o++) {
      sum += value(x * freq, y * freq, period * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  };
}

/**
 * Samples a noise function on a coarse (cells + 1)^2 grid and returns a cheap
 * bilinear lookup for u, v in [0, 1]. Per-pixel fractal noise over a megapixel
 * texture is far too slow for page load; the grid keeps the same soft shapes.
 */
function noiseGrid(sample: (u: number, v: number) => number, cells: number) {
  const n = cells + 1;
  const grid = new Float32Array(n * n);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) grid[j * n + i] = sample(i / cells, j / cells);
  return (u: number, v: number) => {
    const x = Math.min(u * cells, cells - 1e-6);
    const y = Math.min(v * cells, cells - 1e-6);
    const i = Math.floor(x);
    const j = Math.floor(y);
    const fx = x - i;
    const fy = y - j;
    const a = grid[j * n + i];
    const b = grid[j * n + i + 1];
    const c = grid[(j + 1) * n + i];
    const d = grid[(j + 1) * n + i + 1];
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
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

export interface SurfaceTextures {
  marble: Texture;
  stone: Texture;
  plaster: Texture;
  plasterBump: Texture;
  wood: Texture;
  woodBump: Texture;
}

let cache: SurfaceTextures | null = null;

function createMarble(): CanvasTexture {
  // Four 1.5 m slabs per repeat. Each slab has its own vein direction and tone, like real cut stone,
  // so veins break at the joints instead of running unnaturally across the floor.
  // 384 px per 1.5 m slab: ample once the floor's blurred reflection is applied, and it keeps
  // this per-pixel pass short enough not to delay the first frame.
  const size = 768;
  const tile = size / 2;
  const [canvas, ctx] = makeCanvas(size);
  const image = ctx.createImageData(size, size);
  const px = image.data;
  const rand = seededRandom(7);
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 2; tx++) {
      const noise = createNoise(100 + ty * 2 + tx);
      const warpAt = noiseGrid((u, v) => noise(u * 2.4, v * 2.4, 4), 96);
      const fineWarpAt = noiseGrid((u, v) => noise(u * 7 + 31, v * 7 + 31, 3), 96);
      const cloudAt = noiseGrid((u, v) => noise(u * 1.3 + 9, v * 1.3 + 9, 3), 32);
      const angle = rand() * Math.PI;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      // A second, finer network crosses the main veins at a steep angle, as in Calacatta-type stone.
      const angle2 = angle + 0.9 + rand() * 0.5;
      const cb = Math.cos(angle2);
      const sb = Math.sin(angle2);
      const tone = (rand() - 0.5) * 7;
      const veinShift = rand();
      for (let y = 0; y < tile; y++) {
        for (let x = 0; x < tile; x++) {
          const u = x / tile;
          const v = y / tile;
          const warp = warpAt(u, v);
          const fine = fineWarpAt(u, v);
          const along = u * ca + v * sa;
          const across = u * cb + v * sb;
          // Soft-edged primary veins (a few per slab), a fainter secondary network, and hairline veins.
          const p = 1 - Math.abs(Math.sin(Math.PI * (along * 1.25 + warp * 2.2 + veinShift)));
          const q = 1 - Math.abs(Math.sin(Math.PI * (across * 2.1 + warp * 3.6 + fine * 1.6)));
          const r = 1 - Math.abs(Math.sin(Math.PI * (along * 6.5 + fine * 3.4 + 0.2)));
          const p2 = p * p, p4 = p2 * p2, p8 = p4 * p4;
          const q2 = q * q, q4 = q2 * q2, q8 = q4 * q4, q16 = q8 * q8;
          const r2 = r * r, r4 = r2 * r2, r8 = r4 * r4, r16 = r8 * r8, r32 = r16 * r16;
          const primary = p8 * p4; // p^12: a soft halo around a darker core
          const core = primary * primary * p8; // p^32
          const secondary = q16 * q4; // q^20
          const hairline = r32 * r8; // r^40
          const cloud = cloudAt(u, v) - 0.5;
          // The secondary network fades in and out across the slab, so it never reads as parallel lines.
          const patchy = Math.max(0, cloud * 2.2 + 0.35);
          const vein = primary * 30 + core * 46 + secondary * 22 * patchy + hairline * 12 * (1 - patchy * 0.5);
          const ground = tone + cloud * 15;
          const i = ((ty * tile + y) * size + tx * tile + x) * 4;
          // Warm ivory ground; veins are a cool taupe grey with a faint warm halo.
          px[i] = 238 + ground - vein * 0.86;
          px[i + 1] = 231 + ground - vein * 0.9;
          px[i + 2] = 218 + ground * 1.1 - vein * 0.88;
          px[i + 3] = 255;
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0);
  speckle(ctx, size, rand, 2600, 0.03);
  // Fine joints between slabs.
  ctx.strokeStyle = "rgba(96,78,58,0.32)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * tile, 0);
    ctx.lineTo(i * tile, size);
    ctx.moveTo(0, i * tile);
    ctx.lineTo(size, i * tile);
    ctx.stroke();
  }
  return toTexture(canvas, true, 8);
}

/**
 * Honed ivory limestone for the walls: an almost even ground with very soft,
 * low-contrast clouding and fine pores. Kept deliberately quiet: the light
 * (picture lights, wall washes, contact shadows) gives the walls their
 * variation, so the texture never reads as stains or as a repeating pattern.
 */
function createPlaster(): [CanvasTexture, CanvasTexture] {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const image = ctx.createImageData(size, size);
  const noise = createNoise(23, 6);
  const cloudAt = noiseGrid((u, v) => noise(u * 6, v * 6, 4), 96);
  const grainAt = noiseGrid((u, v) => noise(u * 48 + 5, v * 48 + 5, 2), 384);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const n = (cloudAt(u, v) - 0.5) * 7 + (grainAt(u, v) - 0.5) * 5;
      const i = (y * size + x) * 4;
      image.data[i] = 238 + n;
      image.data[i + 1] = 229 + n;
      image.data[i + 2] = 214 + n * 1.1;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  const rand = seededRandom(21);
  // Fine pores and the odd fossil fleck, as in honed limestone.
  for (let i = 0; i < 5200; i++) {
    const dark = rand() > 0.3;
    ctx.fillStyle = dark ? `rgba(120,98,70,${0.05 + rand() * 0.1})` : `rgba(255,252,244,${0.08 + rand() * 0.1})`;
    const r = 0.5 + rand() * 1.1;
    ctx.fillRect(rand() * size, rand() * size, r, r * (0.6 + rand() * 0.8));
  }

  const [bumpCanvas, bump] = makeCanvas(size);
  bump.fillStyle = "#808080";
  bump.fillRect(0, 0, size, size);
  for (let i = 0; i < 9000; i++) {
    bump.fillStyle = `rgba(0,0,0,${0.08 + rand() * 0.18})`;
    const r = 0.5 + rand() * 1.2;
    bump.fillRect(rand() * size, rand() * size, r, r);
  }
  return [toTexture(canvas, true), toTexture(bumpCanvas, false)];
}

function createWood(): [CanvasTexture, CanvasTexture] {
  // Straight-grained walnut. Tileable in both directions: colour bands come from periodic noise
  // across the width, and every grain line uses a whole number of waves down the height.
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const [bumpCanvas, bump] = makeCanvas(size);
  const rand = seededRandom(3);
  const band = createNoise(31, 16);
  for (let x = 0; x < size; x++) {
    const t = band((x / size) * 16, 0.5, 4);
    const fine = band((x / size) * 16 * 5, 7.5, 2);
    // Figured walnut: broad lighter and darker streaks with a reddish warmth.
    const l = 0.8 + (t - 0.5) * 0.7 + (fine - 0.5) * 0.22;
    ctx.fillStyle = `rgb(${Math.round(84 * l)}, ${Math.round(47 * l)}, ${Math.round(29 * l)})`;
    ctx.fillRect(x, 0, 1, size);
  }
  bump.fillStyle = "#808080";
  bump.fillRect(0, 0, size, size);
  const line = (c: CanvasRenderingContext2D, x0: number, amp: number, waves: number, phase: number) => {
    c.beginPath();
    for (let y = 0; y <= size; y += 8) {
      const x = x0 + Math.sin((y / size) * Math.PI * 2 * waves + phase) * amp;
      if (y === 0) c.moveTo(x, y);
      else c.lineTo(x, y);
    }
    c.stroke();
  };
  for (let i = 0; i < 320; i++) {
    const x0 = rand() * size;
    const amp = 0.5 + rand() * 3;
    const waves = 1 + Math.floor(rand() * 3);
    const phase = rand() * Math.PI * 2;
    const alpha = 0.04 + rand() * 0.1;
    const width = 0.5 + rand() * 1.4;
    ctx.strokeStyle = `rgba(18,9,4,${alpha})`;
    bump.strokeStyle = `rgba(0,0,0,${alpha * 1.6})`;
    ctx.lineWidth = width;
    bump.lineWidth = width;
    for (const offset of [0, -size, size]) {
      if (offset !== 0 && Math.abs(x0 + offset - size / 2) > size / 2 + 8) continue;
      line(ctx, x0 + offset, amp, waves, phase);
      line(bump, x0 + offset, amp, waves, phase);
    }
  }
  // Open pores: short dark flecks along the grain.
  for (let i = 0; i < 2600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const a = 0.08 + rand() * 0.12;
    ctx.fillStyle = `rgba(14,7,3,${a})`;
    ctx.fillRect(x, y, 0.8, 2 + rand() * 5);
    bump.fillStyle = `rgba(0,0,0,${a * 1.5})`;
    bump.fillRect(x, y, 0.8, 2 + rand() * 5);
  }
  return [toTexture(canvas, true, 8), toTexture(bumpCanvas, false, 8)];
}

function createStone(): CanvasTexture {
  // Fine pale limestone for mouldings: soft clouding and tiny flecks, no veins.
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const image = ctx.createImageData(size, size);
  const noise = createNoise(57, 8);
  // The noise is periodic over the tile, so the grid's last row/column equals its first and the texture tiles.
  const stoneAt = noiseGrid((u, v) => noise(u * 8, v * 8, 5), 128);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const n = stoneAt(x / size, y / size) - 0.5;
      const i = (y * size + x) * 4;
      image.data[i] = 240 + n * 16;
      image.data[i + 1] = 233 + n * 17;
      image.data[i + 2] = 220 + n * 19;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  speckle(ctx, size, seededRandom(58), 7000, 0.06);
  return toTexture(canvas, true);
}

export function getSurfaceTextures(): SurfaceTextures {
  if (cache) return cache;
  const [plaster, plasterBump] = createPlaster();
  const [wood, woodBump] = createWood();
  const marble = createMarble();
  const stone = createStone();
  cache = { marble, stone, plaster, plasterBump, wood, woodBump };
  return cache;
}

/** A transparent fern-like frond for the entrance planters. */
let frondCache: CanvasTexture | null = null;
export function getFrondTexture(): CanvasTexture {
  if (frondCache) return frondCache;
  const w = 256;
  const h = 512;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable");
  const rand = seededRandom(11);
  const cx = w / 2;
  ctx.strokeStyle = "#3d5a2a";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, h);
  ctx.lineTo(cx, 10);
  ctx.stroke();
  for (let y = h - 30; y > 20; y -= 13) {
    const t = 1 - y / h;
    const len = Math.sin(Math.min(t * 1.15, 1) * Math.PI) * 105 + 8;
    for (const side of [-1, 1]) {
      const g = 90 + Math.floor(rand() * 40);
      ctx.fillStyle = `rgb(${40 + Math.floor(rand() * 20)}, ${g}, ${45 + Math.floor(rand() * 15)})`;
      ctx.beginPath();
      ctx.moveTo(cx, y);
      ctx.quadraticCurveTo(cx + side * len * 0.5, y - 16, cx + side * len, y - 26);
      ctx.quadraticCurveTo(cx + side * len * 0.5, y - 2, cx, y + 6);
      ctx.fill();
    }
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
  /** Dark marble with fine gold-white veins: skirting, plinths and the floor border. */
  darkMarble: CanvasTexture;
  /** Vertical fluting relief for pilaster shafts (bump map). */
  flutes: CanvasTexture;
  /** Fine linen weave for picture mats. */
  linen: CanvasTexture;
}

let detailCache: DetailTextures | null = null;

/** Small tileable textures for architectural details; each is a few cheap canvas draws. */
export function getDetailTextures(): DetailTextures {
  if (detailCache) return detailCache;

  // Dark marble: near-black brown ground, soft cloud, and thin warm veins that wrap around the tile.
  const [marbleCanvas, marble] = makeCanvas(512);
  const rand = seededRandom(73);
  marble.fillStyle = "#3e332c";
  marble.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 120; i++) {
    const r = 30 + rand() * 120;
    const g = marble.createRadialGradient(0, 0, 0, 0, 0, r);
    g.addColorStop(0, rand() > 0.5 ? "rgba(70,56,44,0.10)" : "rgba(10,8,6,0.14)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    marble.save();
    marble.translate(rand() * 512, rand() * 512);
    marble.fillStyle = g;
    marble.fillRect(-r, -r, r * 2, r * 2);
    marble.restore();
  }
  marble.lineCap = "round";
  for (let i = 0; i < 18; i++) {
    const y0 = rand() * 512;
    const slope = (rand() - 0.5) * 0.9;
    const alpha = 0.4 + rand() * 0.45;
    marble.strokeStyle = `rgba(232,214,176,${alpha})`;
    marble.lineWidth = 1 + rand() * 2.2;
    for (const offset of [-512, 0, 512]) {
      marble.beginPath();
      let y = y0 + offset;
      marble.moveTo(0, y);
      for (let x = 16; x <= 512; x += 16) {
        y += slope * 16 + (rand() - 0.5) * 9;
        marble.lineTo(x, y);
      }
      marble.stroke();
    }
  }

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
  detailCache = { darkMarble: toTexture(marbleCanvas, true, 8), flutes, linen: toTexture(linenCanvas, true, 8) };
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
 * light from above, falling off to the sides and the floor) and drawn unlit.
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

  const [wallCanvas, wall] = canvas(256, 256);
  const vertical = wall.createLinearGradient(0, 0, 0, 256);
  vertical.addColorStop(0, "#e8c894");
  vertical.addColorStop(0.5, "#c9a473");
  vertical.addColorStop(1, "#6f5640");
  wall.fillStyle = vertical;
  wall.fillRect(0, 0, 256, 256);
  const sides = wall.createLinearGradient(0, 0, 256, 0);
  sides.addColorStop(0, "rgba(52,36,22,0.7)");
  sides.addColorStop(0.32, "rgba(52,36,22,0)");
  sides.addColorStop(0.68, "rgba(52,36,22,0)");
  sides.addColorStop(1, "rgba(52,36,22,0.7)");
  wall.fillStyle = sides;
  wall.fillRect(0, 0, 256, 256);
  // A downlight's pool on the back of the niche, behind the urn.
  const pool = wall.createRadialGradient(128, 70, 4, 128, 90, 120);
  pool.addColorStop(0, "rgba(255,236,200,0.55)");
  pool.addColorStop(0.5, "rgba(255,226,180,0.18)");
  pool.addColorStop(1, "rgba(255,226,180,0)");
  wall.fillStyle = pool;
  wall.fillRect(0, 0, 256, 256);
  grain(wall, 256, 256, 401);

  const [domeCanvas, dome] = canvas(256, 128);
  const crown = dome.createLinearGradient(0, 0, 0, 128);
  crown.addColorStop(0, "#f6deb0");
  crown.addColorStop(1, "#d9b47e");
  dome.fillStyle = crown;
  dome.fillRect(0, 0, 256, 128);
  dome.fillStyle = sides;
  dome.fillRect(0, 0, 256, 128);
  grain(dome, 256, 128, 402);

  const [sideCanvas, side] = canvas(256, 128);
  const toward = side.createLinearGradient(0, 0, 256, 0);
  toward.addColorStop(0, "#4a3a2b");
  toward.addColorStop(1, "#a7865e");
  side.fillStyle = toward;
  side.fillRect(0, 0, 256, 128);
  const floorShade = side.createLinearGradient(0, 0, 0, 128);
  floorShade.addColorStop(0, "rgba(255,240,215,0.12)");
  floorShade.addColorStop(1, "rgba(40,28,18,0.3)");
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
