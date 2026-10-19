"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useLoader } from "@react-three/fiber";
import {
  AdditiveBlending,
  BackSide,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  SpriteMaterial,
  TextureLoader,
  Vector2,
  type Texture,
} from "three";
import { fitToMetres, type BakedLight } from "@/lib/museum/lightmaps";
import {
  FROND_ALPHA_TEST,
  getDetailTextures,
  getFrondTexture,
  getGlowTexture,
  getSkylightTexture,
  getSoftShadowTexture,
} from "@/lib/museum/textures";

/**
 * Photographed material textures in public/textures, from ambientCG (CC0 1.0),
 * prepared by scripts/optimize-textures.mjs. They load inside the scene's
 * Suspense boundary, so every material is complete before shaders are
 * compiled and the first frame is drawn.
 */
const TEXTURE_URLS = {
  marbleColor: "/textures/marble-ivory-color.webp",
  marbleRoughness: "/textures/marble-ivory-roughness.webp",
  neroColor: "/textures/marble-nero-color.webp",
  neroRoughness: "/textures/marble-nero-roughness.webp",
  walnutColor: "/textures/walnut-color.webp",
  walnutNormal: "/textures/walnut-normal.webp",
  walnutRoughness: "/textures/walnut-roughness.webp",
  limestoneColor: "/textures/limestone-color.webp",
  limestoneNormal: "/textures/limestone-normal.webp",
} as const;
type TextureSet = Record<keyof typeof TEXTURE_URLS, Texture>;

/**
 * One shared set of materials for the whole museum. Every mesh references these
 * instances, so the GPU compiles a handful of programs and nothing is recreated
 * while animating. Materials are disposed when the scene unmounts.
 */
export interface MuseumMaterials {
  plaster: MeshStandardMaterial;
  stone: MeshStandardMaterial;
  /** Fluted limestone for pilaster shafts. */
  pilaster: MeshStandardMaterial;
  /** Polished dark marble with fine white veins: skirting, plinths, floor border. */
  darkStone: MeshStandardMaterial;
  wood: MeshStandardMaterial;
  brass: MeshStandardMaterial;
  bronze: MeshStandardMaterial;
  lanternGlass: MeshStandardMaterial;
  lanternFlame: MeshBasicMaterial;
  skylight: MeshBasicMaterial;
  /** Soft additive halo around a lit lamp. */
  lampHalo: SpriteMaterial;
  /** Lens of a picture-light fixture. */
  fixtureLens: MeshBasicMaterial;
  /** Soft drop shadow on the wall behind a frame. */
  frameShadow: MeshBasicMaterial;
  frameGold: MeshStandardMaterial;
  frameWood: MeshStandardMaterial;
  frameWoodDark: MeshStandardMaterial;
  mat: MeshStandardMaterial;
  matCore: MeshStandardMaterial;
  ceramic: MeshStandardMaterial;
  frond: MeshStandardMaterial;
  leather: MeshStandardMaterial;
  /** Pale marble maps for the floor, which builds its own (optionally reflective) material. One repeat is one slab. */
  floorMarble: { map: Texture; roughnessMap: Texture };
}

const MaterialsContext = createContext<MuseumMaterials | null>(null);

function repeated(texture: Texture, u: number, v: number): Texture {
  const t = texture.clone();
  t.repeat.set(u, v);
  t.needsUpdate = true;
  return t;
}

/**
 * A copy of a loaded texture tiled every `metres` on geometry with metric UVs.
 * Copies share the image on the GPU; only the UV transform differs.
 */
function tiled(source: Texture, metres: number, { colour = false, turn = false } = {}): Texture {
  const t = source.clone();
  t.wrapS = RepeatWrapping;
  t.wrapT = RepeatWrapping;
  t.colorSpace = colour ? SRGBColorSpace : NoColorSpace;
  t.anisotropy = 8;
  t.repeat.set(1 / metres, 1 / metres);
  if (turn) {
    // A quarter turn, so the grain runs vertically (door stiles and leaves).
    t.center.set(0.5, 0.5);
    t.rotation = Math.PI / 2;
  }
  t.needsUpdate = true;
  return t;
}

/** A linear-space tint; components may exceed 1 to lift a texture slightly. */
const tint = (r: number, g: number, b: number) => new Color().setRGB(r, g, b);

function createMaterials(tx: TextureSet): MuseumMaterials {
  const detail = getDetailTextures();
  const linen = repeated(detail.linen, 1 / 0.35, 1 / 0.35);

  // Limestone: the plaster photograph's colour (contrast already halved) tinted ivory, with its fine relief as a
  // normal map. One tile spans 1.6 m on the walls and 1 m on the smaller mouldings.
  const wallColour = tiled(tx.limestoneColor, 1.6, { colour: true });
  const wallNormal = tiled(tx.limestoneNormal, 1.6);
  const stoneColour = tiled(tx.limestoneColor, 1.0, { colour: true });
  const stoneNormal = tiled(tx.limestoneNormal, 1.0);
  // Walnut: one tile is the photographed 80 cm. The doors' grain runs vertically.
  const doorWalnut = {
    map: tiled(tx.walnutColor, 0.8, { colour: true, turn: true }),
    normalMap: tiled(tx.walnutNormal, 0.8, { turn: true }),
    roughnessMap: tiled(tx.walnutRoughness, 0.8, { turn: true }),
  };
  const frameWalnut = {
    map: tiled(tx.walnutColor, 0.6, { colour: true }),
    normalMap: tiled(tx.walnutNormal, 0.6),
    roughnessMap: tiled(tx.walnutRoughness, 0.6),
  };
  // Dark marble on metric-UV boxes (see metricBox and bevelledBox).
  const neroColour = tiled(tx.neroColor, 1.0, { colour: true });
  const neroRoughness = tiled(tx.neroRoughness, 1.0);

  return {
    // Honed ivory limestone for the walls: a warm white, so it does not turn ochre in shadow.
    plaster: new MeshStandardMaterial({
      color: tint(1.07, 0.98, 0.84),
      map: wallColour,
      normalMap: wallNormal,
      normalScale: new Vector2(0.35, 0.35),
      roughness: 0.86,
    }),
    // Honed limestone for mouldings, ribs and the door surround: a shade lighter than the walls.
    stone: new MeshStandardMaterial({
      color: tint(1.12, 1.04, 0.92),
      map: stoneColour,
      normalMap: stoneNormal,
      normalScale: new Vector2(0.25, 0.25),
      roughness: 0.72,
    }),
    // Five flutes across each face of the shaft (its box faces keep 0..1 UVs for this).
    pilaster: new MeshStandardMaterial({
      color: tint(1.12, 1.04, 0.92),
      map: stoneColour,
      bumpMap: detail.flutes,
      bumpScale: 2.2,
      roughness: 0.72,
    }),
    // Polished nero marble. Its roughness map is mirror-smooth (about 0.11), lifted to a softer polish.
    darkStone: new MeshStandardMaterial({ map: neroColour, roughnessMap: neroRoughness, roughness: 2.2 }),
    // Oiled walnut, satin rather than lacquered: the roughness map averages about 0.55.
    wood: new MeshStandardMaterial({
      color: tint(1.05, 1.0, 0.97),
      ...doorWalnut,
      normalScale: new Vector2(0.55, 0.55),
      roughness: 0.92,
    }),
    // Antique brass: a muted, slightly brown gold, softly brushed.
    brass: new MeshStandardMaterial({ color: "#a6834f", metalness: 1, roughness: 0.33 }),
    bronze: new MeshStandardMaterial({ color: "#2e231a", metalness: 0.85, roughness: 0.45 }),
    // Frosted glass around a warm lamp; slightly see-through so the lamp itself reads.
    lanternGlass: new MeshStandardMaterial({
      color: "#ffd8a0",
      emissive: "#ff9a3c",
      emissiveIntensity: 1.7,
      roughness: 0.35,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    }),
    lanternFlame: new MeshBasicMaterial({ color: "#ffe2b0" }),
    // Skylight panels sit on the inside of the vault cylinder, so their visible face is the back face.
    skylight: new MeshBasicMaterial({ map: getSkylightTexture(), side: BackSide }),
    lampHalo: new SpriteMaterial({
      map: getGlowTexture(),
      color: "#ff9a40",
      transparent: true,
      opacity: 0.7,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
    fixtureLens: new MeshBasicMaterial({ color: "#fff1d8" }),
    frameShadow: new MeshBasicMaterial({
      color: "#1a1008",
      alphaMap: getSoftShadowTexture(),
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    }),
    // Antique gold for the fine sight edge of the frames: warm and softly burnished, not bright yellow.
    frameGold: new MeshStandardMaterial({ color: "#b08d55", metalness: 1, roughness: 0.32 }),
    // Walnut moulding, satin finish; the raised lip and inner step are a shade darker than the broad face.
    frameWood: new MeshStandardMaterial({
      color: tint(1.25, 1.12, 1.02),
      ...frameWalnut,
      normalScale: new Vector2(0.45, 0.45),
      roughness: 0.88,
    }),
    frameWoodDark: new MeshStandardMaterial({
      color: tint(0.62, 0.55, 0.5),
      ...frameWalnut,
      normalScale: new Vector2(0.45, 0.45),
      roughness: 0.92,
    }),
    // Ivory linen mat and the paler bevelled core at its window.
    mat: new MeshStandardMaterial({ color: "#fbf7ee", map: linen, roughness: 0.97 }),
    matCore: new MeshStandardMaterial({ color: "#f8f3ea", roughness: 0.9 }),
    ceramic: new MeshStandardMaterial({ color: "#2c2622", roughness: 0.38 }),
    // Palm leaflets: deep green with a slight waxy sheen; both faces are seen. Alpha to coverage turns the
    // leaflets' cut-out edges into multisampled coverage, so they are antialiased like geometry instead of
    // stair-stepped (the canvas is multisampled; no extra pass or draw call). The texture's own mipmaps keep
    // distant leaflets green and whole (see getFrondTexture).
    frond: new MeshStandardMaterial({
      map: getFrondTexture(),
      alphaTest: FROND_ALPHA_TEST,
      alphaToCoverage: true,
      side: DoubleSide,
      roughness: 0.6,
    }),
    leather: new MeshStandardMaterial({ color: "#3a271d", roughness: 0.5 }),
    floorMarble: {
      map: tiled(tx.marbleColor, 1, { colour: true }),
      roughnessMap: tiled(tx.marbleRoughness, 1),
    },
  };
}

/**
 * A matte limestone surface (wall, vault, facade) with baked light and occlusion
 * from lightmaps.ts, for geometry whose UVs are in metres. Shaded diffuse-only
 * (Lambert): honed stone shows almost no specular highlight, and skipping it
 * makes these screen-filling surfaces much cheaper to light. Disposing the
 * material also frees its baked textures.
 */
export function bakedStoneMaterial(
  source: MeshStandardMaterial,
  baked: BakedLight,
  fit: { width: number; height: number; u0?: number; v0?: number },
  lightIntensity: number,
  relief?: { bumpMap: Texture; bumpScale: number },
): MeshLambertMaterial {
  const material = new MeshLambertMaterial({
    color: source.color,
    map: source.map,
    // A relief map (the vault's coffers) replaces the stone's own fine normal map: three uses one or the other.
    ...(relief ? { bumpMap: relief.bumpMap, bumpScale: relief.bumpScale } : { normalMap: source.normalMap, normalScale: source.normalScale }),
    side: source.side,
    lightMap: fitToMetres(baked.light, fit.width, fit.height, fit.u0, fit.v0),
    lightMapIntensity: lightIntensity,
    aoMap: fitToMetres(baked.ao, fit.width, fit.height, fit.u0, fit.v0),
  });
  const dispose = material.dispose.bind(material);
  material.dispose = () => {
    dispose();
    baked.dispose();
    relief?.bumpMap.dispose();
  };
  return material;
}

const TEXTURE_KEYS = Object.keys(TEXTURE_URLS) as (keyof typeof TEXTURE_URLS)[];

export function MaterialsProvider({ children }: { children: ReactNode }) {
  // Loaded with useLoader rather than drei's useTexture, which uploads every image to the GPU on arrival. The
  // materials only draw tiled copies, whose wrapping, colour space and anisotropy give them GPU textures of their
  // own, so uploading the originals as well cost main-thread time while loading and ~36 MB of GPU memory.
  const loaded = useLoader(TextureLoader, TEXTURE_KEYS.map((key) => TEXTURE_URLS[key]));
  const materials = useMemo(
    () => createMaterials(Object.fromEntries(TEXTURE_KEYS.map((key, i) => [key, loaded[i]])) as TextureSet),
    [loaded],
  );
  useEffect(
    () => () => {
      for (const value of Object.values(materials)) {
        if (value instanceof MeshStandardMaterial) {
          // The tiled copies; the loaded originals stay in the loader's cache.
          [value.map, value.bumpMap, value.normalMap, value.roughnessMap].forEach((t) => t?.dispose());
          value.dispose();
        } else if ("dispose" in value) {
          value.dispose();
        } else {
          value.map.dispose();
          value.roughnessMap.dispose();
        }
      }
    },
    [materials],
  );
  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>;
}

export function useMuseumMaterials(): MuseumMaterials {
  const materials = useContext(MaterialsContext);
  if (!materials) throw new Error("useMuseumMaterials must be used inside <MaterialsProvider>");
  return materials;
}
