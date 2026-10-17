"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import { BackSide, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, type Texture } from "three";
import { getFrondTexture, getSurfaceTextures } from "@/lib/museum/textures";

/**
 * One shared set of materials for the whole museum. Every mesh references these
 * instances, so the GPU compiles a handful of programs and nothing is recreated
 * while animating. Materials are disposed when the scene unmounts.
 */
export interface MuseumMaterials {
  plaster: MeshStandardMaterial;
  stone: MeshStandardMaterial;
  darkStone: MeshStandardMaterial;
  wood: MeshStandardMaterial;
  brass: MeshStandardMaterial;
  bronze: MeshStandardMaterial;
  lanternGlass: MeshStandardMaterial;
  skylight: MeshBasicMaterial;
  frameGold: MeshStandardMaterial;
  frameLiner: MeshStandardMaterial;
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
  // ExtrudeGeometry and the scaled plane UVs are in metres; one texture tile spans several metres.
  const plasterMap = repeated(tex.plaster, 1 / 5, 1 / 5);
  const plasterBump = repeated(tex.plasterBump, 1 / 1.5, 1 / 1.5);
  const stoneMap = repeated(tex.plaster, 1 / 2, 1 / 2);
  const woodMap = repeated(tex.wood, 1 / 1.6, 1 / 5);
  const woodBump = repeated(tex.woodBump, 1 / 1.6, 1 / 5);

  return {
    plaster: new MeshStandardMaterial({
      color: "#f2e8d8",
      map: plasterMap,
      bumpMap: plasterBump,
      bumpScale: 0.35,
      roughness: 0.9,
    }),
    stone: new MeshStandardMaterial({ color: "#f6eee0", map: stoneMap, roughness: 0.62 }),
    darkStone: new MeshStandardMaterial({ color: "#4a3a2d", roughness: 0.32 }),
    wood: new MeshStandardMaterial({
      color: "#ffffff",
      map: woodMap,
      bumpMap: woodBump,
      bumpScale: 0.6,
      roughness: 0.48,
    }),
    brass: new MeshStandardMaterial({ color: "#d1a660", metalness: 1, roughness: 0.28 }),
    bronze: new MeshStandardMaterial({ color: "#2e231a", metalness: 0.85, roughness: 0.42 }),
    lanternGlass: new MeshStandardMaterial({
      color: "#ffe0b0",
      emissive: "#ffb765",
      emissiveIntensity: 2.4,
      roughness: 0.2,
    }),
    // Skylight panels sit on the inside of the vault cylinder, so their visible face is the back face.
    skylight: new MeshBasicMaterial({ color: "#fff4e0", side: BackSide }),
    frameGold: new MeshStandardMaterial({ color: "#c0904a", metalness: 1, roughness: 0.3 }),
    frameLiner: new MeshStandardMaterial({ color: "#ebe2d0", roughness: 0.95 }),
    ceramic: new MeshStandardMaterial({ color: "#2c2622", roughness: 0.38 }),
    frond: new MeshStandardMaterial({
      map: getFrondTexture(),
      alphaTest: 0.5,
      side: DoubleSide,
      roughness: 0.75,
    }),
    leather: new MeshStandardMaterial({ color: "#5a4030", roughness: 0.6 }),
    marbleMap: tex.marble,
  };
}

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const materials = useMemo(() => createMaterials(), []);
  useEffect(
    () => () => {
      for (const value of Object.values(materials) as (MeshStandardMaterial | MeshBasicMaterial | Texture)[]) {
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
