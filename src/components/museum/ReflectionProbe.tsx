"use client";

import { useContext, useLayoutEffect, useMemo } from "react";
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
  type WebGLRenderer,
} from "three";
import { useMuseumMaterials } from "./materials";
import { ContextRestorations } from "./helpers";

/** A light panel: [position, [width, height], colour, intensity]. Each faces the origin. */
type Panel = [[number, number, number], [number, number], string, number];

/**
 * What the polished surfaces reflect, as light panels around the origin: a
 * long warm strip overhead (the skylights and cove light), small hot spots for
 * the picture lights, dim warm walls and a darker floor. The contrast between them is what makes brass
 * and gilding read as metal.
 */
const PANELS: Panel[] = [
  [[0, 8, 0], [3, 30], "#fff2df", 2.6],
  ...([-1, 1].flatMap((x) =>
    [-6, 0, 6].map((z) => [[x * 4.2, 5.2, z], [0.5, 0.5], "#ffdcaa", 16] as Panel),
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
 * Soft light around the corridor's stone mouldings, as seen from mid-corridor: the cove-lit vault and
 * skylights overhead, the lit limestone walls either side and the pale marble floor below. No hot spots,
 * so on matte stone it reads as directional fill, not as reflections: the tops of rails, capitals and
 * cornices catch the light from above and their undersides fall a little darker.
 */
const STONE_FILL: Panel[] = [
  [[0, 8, 0], [12, 30], "#ffedd6", 1.5],
  [[-8, 3, 0], [30, 7], "#efdfc6", 0.45],
  [[8, 3, 0], [30, 7], "#efdfc6", 0.45],
  [[0, 3, -14], [12, 7], "#e6d8c2", 0.3],
  [[0, 3, 14], [12, 7], "#e6d8c2", 0.3],
  [[0, -4, 0], [30, 30], "#dbc8ac", 0.36],
];

/**
 * Renders light panels into a small cube map once. It matches the scene
 * environment's resolution, so materials using it keep the same shader programs.
 * The panels are kept until the cube map is disposed: freeing them straight after
 * the render deletes shader programs the browser may still be compiling.
 */
function renderPanels(gl: WebGLRenderer, panels: readonly Panel[]) {
  const target = new WebGLCubeRenderTarget(64, { type: HalfFloatType });
  const scene = new Scene();
  scene.background = new Color("#120c08");
  const geometry = new PlaneGeometry(1, 1);
  const materials = panels.map(([position, [w, h], color, intensity]) => {
    const material = new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide, toneMapped: false });
    const mesh = new Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.scale.set(w, h, 1);
    mesh.lookAt(0, position[1] > 6 || position[1] < -2 ? 0 : position[1], 0);
    scene.add(mesh);
    return material;
  });
  new CubeCamera(0.1, 100, target).update(gl, scene);
  return {
    texture: target.texture,
    dispose: () => {
      target.dispose();
      geometry.dispose();
      materials.forEach((material) => material.dispose());
    },
  };
}

/**
 * Gives each material the panels' cube map as its environment, at its own
 * intensity. Returns the cleanup that takes it away again.
 */
function applyPanels(gl: WebGLRenderer, panels: readonly Panel[], targets: readonly [MeshStandardMaterial, number][]) {
  const probe = renderPanels(gl, panels);
  for (const [material, intensity] of targets) {
    material.envMap = probe.texture;
    material.envMapIntensity = intensity;
    material.needsUpdate = true;
  }
  return () => {
    for (const [material] of targets) {
      material.envMap = null;
      material.needsUpdate = true;
    }
    probe.dispose();
  };
}

/**
 * Lights the materials with the panels while the component is mounted. Drawn again (into a new cube map, the
 * old one freed) after a WebGL context restore, which leaves the drawn one blank.
 */
function usePanelEnvironment(panels: readonly Panel[], targets: readonly [MeshStandardMaterial, number][]) {
  const gl = useThree((s) => s.gl);
  const restorations = useContext(ContextRestorations);
  // `restorations` is only a trigger: each restore draws the panels again.
  useLayoutEffect(() => applyPanels(gl, panels, targets), [gl, panels, targets, restorations]);
}

/**
 * Renders the panels into a small cube map once and gives it to the polished
 * materials as their environment, in place of the soft scene-wide fill (which
 * stays on the entrance's stone and on plaster). Nothing is rendered per frame.
 */
export function ReflectionProbe() {
  const m = useMuseumMaterials();
  const targets = useMemo(() => reflectiveMaterials(m), [m]);
  usePanelEnvironment(PANELS, targets);
  return null;
}

/**
 * Soft directional fill for the corridor's stone mouldings, pilasters and ribs
 * (see STONE_FILL). They have no baked light of their own, so without it they
 * read darker than the lit walls behind them. Rendered once, like the probe.
 */
export function useStoneFill(targets: readonly [MeshStandardMaterial, number][]) {
  usePanelEnvironment(STONE_FILL, targets);
}
