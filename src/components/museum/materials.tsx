"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import {
  AdditiveBlending,
  BackSide,
  DoubleSide,
  MeshBasicMaterial,
  MeshLambertMaterial,
  MeshStandardMaterial,
  SpriteMaterial,
  type Texture,
} from "three";
import { fitToMetres, type BakedLight } from "@/lib/museum/lightmaps";
import {
  getDetailTextures,
  getFrondTexture,
  getGlowTexture,
  getSkylightTexture,
  getSoftShadowTexture,
  getSurfaceTextures,
} from "@/lib/museum/textures";

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
  /** Polished dark marble with fine veins: skirting, plinths, floor border. */
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
  /** Marble texture for the floor, which builds its own (optionally reflective) material. */
  marbleMap: Texture;
}

const MaterialsContext = createContext<MuseumMaterials | null>(null);

function repeated(texture: Texture, u: number, v: number): Texture {
  const t = texture.clone();
  t.repeat.set(u, v);
  t.needsUpdate = true;
  return t;
}

function createMaterials(): MuseumMaterials {
  const tex = getSurfaceTextures();
  const detail = getDetailTextures();
  // ExtrudeGeometry and the scaled plane UVs are in metres; one limestone tile spans 2.5 m.
  const plasterMap = repeated(tex.plaster, 1 / 2.5, 1 / 2.5);
  const plasterBump = repeated(tex.plasterBump, 1 / 1.25, 1 / 1.25);
  const stoneMap = repeated(tex.stone, 1 / 1.2, 1 / 1.2);
  const stoneBump = repeated(tex.plasterBump, 1 / 0.8, 1 / 0.8);
  const woodMap = repeated(tex.wood, 1 / 1.6, 1 / 5);
  const woodBump = repeated(tex.woodBump, 1 / 1.6, 1 / 5);
  // Box faces carry metric UVs (see metricBox), so one repeat spans 1.2 m of dark marble.
  const darkMarble = repeated(detail.darkMarble, 1 / 1.2, 1 / 1.2);
  const linen = repeated(detail.linen, 1 / 0.35, 1 / 0.35);

  return {
    // Honed ivory limestone for the walls.
    plaster: new MeshStandardMaterial({
      color: "#f7eee0",
      map: plasterMap,
      bumpMap: plasterBump,
      bumpScale: 0.08,
      roughness: 0.86,
    }),
    // Honed limestone for mouldings, ribs and the door surround.
    stone: new MeshStandardMaterial({ color: "#fbf4e8", map: stoneMap, bumpMap: stoneBump, bumpScale: 0.12, roughness: 0.72 }),
    // Five flutes across each face of the shaft (box faces have 0..1 UVs).
    pilaster: new MeshStandardMaterial({ color: "#fbf4e8", map: stoneMap, bumpMap: detail.flutes, bumpScale: 2.2, roughness: 0.72 }),
    darkStone: new MeshStandardMaterial({ color: "#ffffff", map: darkMarble, roughness: 0.28 }),
    // Oiled walnut: satin, not lacquered.
    wood: new MeshStandardMaterial({
      color: "#eadfd4",
      map: woodMap,
      bumpMap: woodBump,
      bumpScale: 0.45,
      roughness: 0.5,
    }),
    // Aged brass: warm, softly brushed.
    brass: new MeshStandardMaterial({ color: "#a88752", metalness: 1, roughness: 0.38 }),
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
      opacity: 1,
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
    frameGold: new MeshStandardMaterial({ color: "#b39058", metalness: 1, roughness: 0.34 }),
    // Dark walnut moulding, satin finish; the raised lip and inner step are a shade darker than the face.
    frameWood: new MeshStandardMaterial({ color: "#c8a68a", map: woodMap, roughness: 0.44 }),
    frameWoodDark: new MeshStandardMaterial({ color: "#8d6c58", map: woodMap, roughness: 0.48 }),
    // Ivory linen mat and the paler bevelled core at its window.
    mat: new MeshStandardMaterial({ color: "#fbf7ee", map: linen, roughness: 0.97 }),
    matCore: new MeshStandardMaterial({ color: "#f8f3ea", roughness: 0.9 }),
    ceramic: new MeshStandardMaterial({ color: "#2c2622", roughness: 0.38 }),
    frond: new MeshStandardMaterial({
      map: getFrondTexture(),
      alphaTest: 0.5,
      side: DoubleSide,
      roughness: 0.75,
    }),
    leather: new MeshStandardMaterial({ color: "#3a271d", roughness: 0.5 }),
    marbleMap: tex.marble,
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
    bumpMap: relief?.bumpMap ?? source.bumpMap,
    bumpScale: relief?.bumpScale ?? source.bumpScale,
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

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const materials = useMemo(() => createMaterials(), []);
  useEffect(
    () => () => {
      for (const value of Object.values(materials) as (MeshStandardMaterial | MeshBasicMaterial | SpriteMaterial | Texture)[]) {
        if (value instanceof MeshStandardMaterial) {
          value.map?.dispose();
          value.bumpMap?.dispose();
        }
        value.dispose();
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
