"use client";

import { useLayoutEffect } from "react";
import { useThree } from "@react-three/fiber";
import {
  Color,
  CubeCamera,
  DoubleSide,
  HalfFloatType,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Scene,
  WebGLCubeRenderTarget,
  type MeshStandardMaterial,
} from "three";
import { useMuseumMaterials } from "./materials";

/**
 * What the polished surfaces reflect, as light panels around the origin:
 * [position, [width, height], colour, intensity]. A long warm strip overhead
 * (the skylights and cove light), small hot spots for the picture lights, dim
 * warm walls and a darker floor. The contrast between them is what makes brass
 * and gilding read as metal.
 */
const PANELS: [[number, number, number], [number, number], string, number][] = [
  [[0, 8, 0], [3, 30], "#fff2df", 2.6],
  ...([-1, 1].flatMap((x) =>
    [-6, 0, 6].map((z) => [[x * 4.2, 5.2, z], [0.5, 0.5], "#ffdcaa", 16] as [[number, number, number], [number, number], string, number]),
  )),
  [[-8, 2.5, 0], [30, 6], "#d6bf9c", 0.32],
  [[8, 2.5, 0], [30, 6], "#d6bf9c", 0.32],
  [[0, 2.5, -14], [10, 6], "#c9ad86", 0.22],
  [[0, 2.5, 14], [10, 6], "#c9ad86", 0.22],
  [[0, -4, 0], [30, 30], "#6e5842", 0.22],
];

/** Polished materials and how strongly each reflects the probe. */
function reflectiveMaterials(m: ReturnType<typeof useMuseumMaterials>): [MeshStandardMaterial, number][] {
  return [
    [m.brass, 1.1],
    [m.bronze, 0.8],
    [m.frameGold, 1.1],
    [m.frameWood, 0.55],
    [m.frameWoodDark, 0.55],
    [m.wood, 0.7],
    [m.darkStone, 0.75],
    [m.ceramic, 0.7],
    [m.leather, 0.4],
  ];
}

/**
 * Renders the panels into a small cube map once and gives it to the polished
 * materials as their environment, in place of the soft scene-wide fill (which
 * stays on stone and plaster). Nothing is rendered per frame. The cube map
 * matches the scene environment's resolution, so the materials keep the same
 * shader programs.
 */
export function ReflectionProbe() {
  const gl = useThree((s) => s.gl);
  const m = useMuseumMaterials();

  useLayoutEffect(() => {
    const target = new WebGLCubeRenderTarget(64, { type: HalfFloatType });
    const scene = new Scene();
    scene.background = new Color("#120c08");
    const geometry = new PlaneGeometry(1, 1);
    const panelMaterials = PANELS.map(([position, [w, h], color, intensity]) => {
      const material = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide, toneMapped: false });
      const mesh = new Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(w, h, 1);
      mesh.lookAt(0, position[1] > 6 || position[1] < -2 ? 0 : position[1], 0);
      scene.add(mesh);
      return material;
    });
    new CubeCamera(0.1, 100, target).update(gl, scene);

    const targets = reflectiveMaterials(m);
    for (const [material, intensity] of targets) {
      material.envMap = target.texture;
      material.envMapIntensity = intensity;
      material.needsUpdate = true;
    }
    return () => {
      for (const [material] of targets) {
        material.envMap = null;
        material.needsUpdate = true;
      }
      target.dispose();
      geometry.dispose();
      panelMaterials.forEach((material) => material.dispose());
    };
  }, [gl, m]);

  return null;
}
