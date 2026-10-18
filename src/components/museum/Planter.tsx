"use client";

import { useMemo } from "react";
import { CylinderGeometry, LatheGeometry, PlaneGeometry, Vector2 } from "three";
import { useMuseumMaterials } from "./materials";
import { DETAIL_LAYER, InstancedParts, useDisposable, type InstanceTransform } from "./helpers";

/** Urn profile (radius, height) in metres before scaling: a tall glazed vessel with a rolled lip. */
const URN_PROFILE: [number, number][] = [
  [0.0, 0],
  [0.2, 0],
  [0.24, 0.05],
  [0.23, 0.12],
  [0.3, 0.38],
  [0.36, 0.72],
  [0.35, 0.92],
  [0.31, 1.0],
  [0.34, 1.04],
  [0.32, 1.07],
  [0.29, 1.03],
  [0.0, 1.03],
];
const RIM = 1.02;
/** A kentia palm: a few upright young fronds at the centre and longer ones arching out around them. */
const FROND_COUNT = 18;
const FROND = { width: 0.86, length: 1.45 } as const;

/**
 * A dark glazed ceramic urn with a kentia palm. The fronds are one instanced
 * mesh, so a planter costs three draw calls however many fronds it has.
 */
export function Planter({ position, seed, scale = 1 }: { position: [number, number, number]; seed: number; scale?: number }) {
  const m = useMuseumMaterials();
  const urn = useDisposable(() => new LatheGeometry(URN_PROFILE.map(([x, y]) => new Vector2(x, y)), 32));
  const frond = useDisposable(() => {
    const { width, length } = FROND;
    const g = new PlaneGeometry(width, length, 4, 16);
    g.translate(0, length / 2, 0);
    const pos = g.getAttribute("position");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const t = y / length;
      const side = Math.abs(x) / (width / 2);
      // The frond arches outward (+z, which faces out and down once tilted) and shortens as it bends; the
      // leaflets fold down from the midrib into a shallow V, drooping more toward the tip.
      const arch = t * t * length * 0.55;
      const droop = side * 0.2 * (0.35 + t) + side * side * 0.1;
      pos.setZ(i, arch + droop);
      pos.setY(i, y - t * t * length * 0.12);
    }
    g.computeVertexNormals();
    return g;
  });
  const soil = useDisposable(() => new CylinderGeometry(0.29, 0.29, 0.02, 20));
  const fronds = useMemo<InstanceTransform[]>(() => {
    const items: InstanceTransform[] = [];
    for (let i = 0; i < FROND_COUNT; i++) {
      const angle = i * 2.39996 + seed;
      // The first few are young fronds standing nearly upright; the rest arch out progressively further.
      const young = i < 4;
      const tilt = young ? 0.12 + i * 0.06 : 0.4 + ((i * 7) % 11) * 0.055;
      const s = young ? 0.72 + i * 0.05 : 0.85 + ((i * 37) % 10) / 30;
      items.push({ position: [0, RIM - 0.02, 0], rotation: [tilt, angle, 0], scale: [s, s, s] });
    }
    return items;
  }, [seed]);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={urn} material={m.ceramic} castShadow receiveShadow />
      {/* Soil inside the rim: never visible in the floor's reflection */}
      <mesh geometry={soil} material={m.leather} position={[0, RIM, 0]} layers={DETAIL_LAYER} />
      <InstancedParts geometry={frond} material={m.frond} transforms={fronds} />
    </group>
  );
}
