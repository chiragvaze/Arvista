import { CanvasTexture, RepeatWrapping, SRGBColorSpace, NoColorSpace, type Texture } from "three";

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

function drawVein(ctx: CanvasRenderingContext2D, size: number, rand: () => number, width: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  let x = rand() * size;
  let y = -20;
  ctx.moveTo(x, y);
  const angle = (rand() - 0.5) * 1.2 + 0.35;
  while (y < size + 20) {
    const step = 18 + rand() * 30;
    x += Math.sin(angle) * step + (rand() - 0.5) * 22;
    y += Math.cos(angle) * step;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export interface SurfaceTextures {
  marble: Texture;
  plaster: Texture;
  plasterBump: Texture;
  wood: Texture;
  woodBump: Texture;
}

let cache: SurfaceTextures | null = null;

function createMarble(): CanvasTexture {
  const size = 1024;
  const [canvas, ctx] = makeCanvas(size);
  const rand = seededRandom(7);
  // Two tiles per texture repeat, each tile a slightly different cream.
  const tile = size / 2;
  for (let ty = 0; ty < 2; ty++) {
    for (let tx = 0; tx < 2; tx++) {
      const l = 86 + rand() * 4;
      ctx.fillStyle = `hsl(38, 30%, ${l}%)`;
      ctx.fillRect(tx * tile, ty * tile, tile, tile);
    }
  }
  const grad = ctx.createRadialGradient(size * 0.3, size * 0.4, 50, size * 0.5, size * 0.5, size * 0.8);
  grad.addColorStop(0, "rgba(255,250,240,0.25)");
  grad.addColorStop(1, "rgba(160,130,95,0.12)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  speckle(ctx, size, rand, 9000, 0.05);

  ctx.save();
  ctx.filter = "blur(3px)";
  for (let i = 0; i < 7; i++) drawVein(ctx, size, rand, 6 + rand() * 8, "rgba(150,120,90,0.10)");
  ctx.restore();
  for (let i = 0; i < 14; i++) drawVein(ctx, size, rand, 0.8 + rand() * 1.4, `rgba(120,92,64,${0.18 + rand() * 0.2})`);
  for (let i = 0; i < 6; i++) drawVein(ctx, size, rand, 0.6, "rgba(180,150,110,0.35)");

  // Tile joints.
  ctx.strokeStyle = "rgba(90,70,50,0.35)";
  ctx.lineWidth = 2;
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

function createPlaster(): [CanvasTexture, CanvasTexture] {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const rand = seededRandom(21);
  ctx.fillStyle = "#ece2d2";
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 260; i++) {
    const r = 20 + rand() * 90;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    const warm = rand() > 0.5;
    g.addColorStop(0, warm ? "rgba(214,190,160,0.035)" : "rgba(255,252,245,0.045)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.save();
    ctx.translate(rand() * size, rand() * size);
    ctx.fillStyle = g;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }
  speckle(ctx, size, rand, 6000, 0.05);

  const [bumpCanvas, bump] = makeCanvas(size);
  bump.fillStyle = "#808080";
  bump.fillRect(0, 0, size, size);
  speckle(bump, size, rand, 14000, 0.22);
  return [toTexture(canvas, true), toTexture(bumpCanvas, false)];
}

function createWood(): [CanvasTexture, CanvasTexture] {
  const size = 512;
  const [canvas, ctx] = makeCanvas(size);
  const [bumpCanvas, bump] = makeCanvas(size);
  const rand = seededRandom(3);
  ctx.fillStyle = "#3b2416";
  ctx.fillRect(0, 0, size, size);
  bump.fillStyle = "#808080";
  bump.fillRect(0, 0, size, size);
  // Vertical grain: long wavy streaks of varying darkness.
  for (let i = 0; i < 420; i++) {
    const x0 = rand() * size;
    const dark = rand() > 0.45;
    const alpha = 0.05 + rand() * 0.16;
    const width = 0.6 + rand() * 2.6;
    const wobble = rand() * 6;
    const phase = rand() * Math.PI * 2;
    ctx.strokeStyle = dark ? `rgba(20,10,4,${alpha})` : `rgba(120,78,46,${alpha * 0.8})`;
    bump.strokeStyle = dark ? `rgba(0,0,0,${alpha * 1.4})` : `rgba(255,255,255,${alpha})`;
    ctx.lineWidth = width;
    bump.lineWidth = width;
    for (const c of [ctx, bump]) {
      c.beginPath();
      for (let y = -10; y <= size + 10; y += 16) {
        const x = x0 + Math.sin(y / 70 + phase) * wobble;
        if (y === -10) c.moveTo(x, y);
        else c.lineTo(x, y);
      }
      c.stroke();
    }
  }
  return [toTexture(canvas, true, 8), toTexture(bumpCanvas, false, 8)];
}

export function getSurfaceTextures(): SurfaceTextures {
  if (cache) return cache;
  const [plaster, plasterBump] = createPlaster();
  const [wood, woodBump] = createWood();
  cache = { marble: createMarble(), plaster, plasterBump, wood, woodBump };
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
