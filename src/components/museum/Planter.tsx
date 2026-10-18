"use client";

import { useMemo } from "react";
import { CylinderGeometry, LatheGeometry, PlaneGeometry, Vector2 } from "three";
import { useMuseumMaterials } from "./materials";
import { InstancedParts, useDisposable, type InstanceTransform } from "./helpers";

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
const FROND_COUNT = 34;

/**
 * A dark glazed ceramic urn with an arching palm. The fronds are one instanced
 * mesh, so a planter costs three draw calls however many leaves it has.
 */
export function Planter({ position, seed, scale = 1 }: { position: [number, number, number]; seed: number; scale?: number }) {
  const m = useMuseumMaterials();
  const urn = useDisposable(() => new LatheGeometry(URN_PROFILE.map(([x, y]) => new Vector2(x, y)), 32));
  const frond = useDisposable(() => {
    const g = new PlaneGeometry(0.52, 1.65, 1, 10);
    g.translate(0, 0.825, 0);
    const pos = g.getAttribute("position");
    // Arch each frond outward and let its tip droop.
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      pos.setZ(i, y * y * 0.36);
      pos.setY(i, y - y * y * 0.2);
    }
    g.computeVertexNormals();
    return g;
  });
  const soil = useDisposable(() => new CylinderGeometry(0.29, 0.29, 0.02, 20));
  const fronds = useMemo<InstanceTransform[]>(() => {
    const items: InstanceTransform[] = [];
    for (let i = 0; i < FROND_COUNT; i++) {
      const angle = i * 2.39996 + seed;
      const tilt = 0.18 + (i % 4) * 0.16;
      const s = 0.75 + ((i * 37) % 10) / 22;
      items.push({ position: [0, RIM, 0], rotation: [tilt, angle, 0], scale: [s, s, s] });
    }
    return items;
  }, [seed]);
  return (
    <group position={position} scale={scale}>
      <mesh geometry={urn} material={m.ceramic} castShadow receiveShadow />
      <mesh geometry={soil} material={m.leather} position={[0, RIM, 0]} />
      <InstancedParts geometry={frond} material={m.frond} transforms={fronds} />
    </group>
  );
}
