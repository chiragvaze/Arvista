"use client";

import { useMemo } from "react";
import { BoxGeometry, ConeGeometry, CylinderGeometry, LatheGeometry, PlaneGeometry, Vector2 } from "three";
import { DOORWAY, FACADE, INNER_FACADE, PORTICO } from "@/lib/museum/layout";
import { archBandGeometry, archedWallGeometry } from "@/lib/museum/geometry";
import { useMuseumMaterials } from "./materials";
import { InstancedParts, useDisposable, type InstanceTransform } from "./helpers";
import type { QualityTier } from "@/lib/museum/deviceTier";

const FRONT_Z = PORTICO.depth;
const ARCHIVOLT_BAND = 0.55;
const PILASTER_XS = [-10.6, -5.7, 5.7, 10.6];

/**
 * The exterior: an outer facade whose great arch frames a recessed portico,
 * and the inner facade holding the doorway, with lanterns and planters.
 */
export function Entrance({ quality }: { quality: QualityTier }) {
  const m = useMuseumMaterials();

  const outerWall = useDisposable(() =>
    archedWallGeometry({
      width: FACADE.width,
      height: FACADE.height,
      archHalfWidth: FACADE.archHalfWidth,
      archSpring: FACADE.archSpring,
      depth: PORTICO.depth,
    }),
  );
  const innerWall = useDisposable(() =>
    archedWallGeometry({
      width: INNER_FACADE.halfWidth * 2,
      height: INNER_FACADE.height,
      archHalfWidth: DOORWAY.halfWidth,
      archSpring: DOORWAY.spring,
      depth: INNER_FACADE.thickness,
    }),
  );
  const archivolt = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: FACADE.archHalfWidth, spring: FACADE.archSpring, band: ARCHIVOLT_BAND, depth: 0.16, bevel: 0.04 }),
  );
  const archivoltOuter = useDisposable(() =>
    archBandGeometry({
      innerHalfWidth: FACADE.archHalfWidth + ARCHIVOLT_BAND + 0.04,
      spring: FACADE.archSpring,
      band: 0.14,
      depth: 0.26,
      bevel: 0.02,
    }),
  );
  const porticoRib = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: FACADE.archHalfWidth - 0.22, spring: FACADE.archSpring, band: 0.24, depth: 0.32 }),
  );
  const doorSurround = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: DOORWAY.halfWidth, spring: DOORWAY.spring, band: 0.42, depth: 0.12, bevel: 0.03 }),
  );
  const doorBead = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: DOORWAY.halfWidth - 0.02, spring: DOORWAY.spring, band: 0.09, depth: 0.24, bevel: 0.015 }),
  );

  // Pilasters on the outer facade: shaft, base and capital, each drawn instanced.
  const pilasterShaft = useDisposable(() => new BoxGeometry(0.9, 11.8, 0.3));
  const pilasterBase = useDisposable(() => new BoxGeometry(1.2, 0.55, 0.46));
  const pilasterCapital = useDisposable(() => new BoxGeometry(1.25, 0.5, 0.5));
  const shafts = useMemo<InstanceTransform[]>(() => PILASTER_XS.map((x) => ({ position: [x, 5.9, FRONT_Z + 0.15] })), []);
  const bases = useMemo<InstanceTransform[]>(() => PILASTER_XS.map((x) => ({ position: [x, 0.275, FRONT_Z + 0.23] })), []);
  const capitals = useMemo<InstanceTransform[]>(() => PILASTER_XS.map((x) => ({ position: [x, 12.05, FRONT_Z + 0.25] })), []);

  const stringCourseX = FACADE.archHalfWidth + ARCHIVOLT_BAND + 0.2;
  const stringCourseLength = FACADE.width / 2 - stringCourseX;
  const keystoneY = FACADE.archSpring + FACADE.archHalfWidth + ARCHIVOLT_BAND * 0.45;

  return (
    <group>
      {/* Outer facade; its arched opening's reveal forms the portico walls and barrel vault. */}
      <mesh geometry={outerWall} material={m.plaster} receiveShadow />
      <mesh geometry={archivolt} material={m.stone} position={[0, 0, FRONT_Z]} />
      <mesh geometry={archivoltOuter} material={m.stone} position={[0, 0, FRONT_Z]} />
      <mesh material={m.stone} position={[0, keystoneY, FRONT_Z + 0.22]}>
        <boxGeometry args={[0.72, 1.05, 0.34]} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side}>
          {/* Impost blocks where the arch springs, and plinths at the foot of the archivolt. */}
          <mesh material={m.stone} position={[side * (FACADE.archHalfWidth + ARCHIVOLT_BAND / 2), FACADE.archSpring - 0.15, FRONT_Z + 0.16]}>
            <boxGeometry args={[ARCHIVOLT_BAND + 0.2, 0.3, 0.3]} />
          </mesh>
          <mesh material={m.darkStone} position={[side * (FACADE.archHalfWidth + ARCHIVOLT_BAND / 2), 0.3, FRONT_Z + 0.14]}>
            <boxGeometry args={[ARCHIVOLT_BAND + 0.16, 0.6, 0.32]} />
          </mesh>
          <mesh material={m.stone} position={[side * (stringCourseX + stringCourseLength / 2), FACADE.archSpring - 0.15, FRONT_Z + 0.06]}>
            <boxGeometry args={[stringCourseLength, 0.22, 0.12]} />
          </mesh>
        </group>
      ))}
      <InstancedParts geometry={pilasterShaft} material={m.stone} transforms={shafts} />
      <InstancedParts geometry={pilasterBase} material={m.darkStone} transforms={bases} />
      <InstancedParts geometry={pilasterCapital} material={m.stone} transforms={capitals} />
      {/* Entablature and cornice across the facade. */}
      <mesh material={m.stone} position={[0, 12.85, FRONT_Z + 0.2]}>
        <boxGeometry args={[FACADE.width, 1.1, 0.4]} />
      </mesh>
      <mesh material={m.stone} position={[0, 13.5, FRONT_Z + 0.32]}>
        <boxGeometry args={[FACADE.width, 0.24, 0.66]} />
      </mesh>

      {/* Ribs across the portico vault. */}
      {[0.85, 2.0].map((z) => (
        <mesh key={z} geometry={porticoRib} material={m.stone} position={[0, 0, z]} />
      ))}

      {/* Inner facade with the doorway and its stone surround. */}
      <mesh geometry={innerWall} material={m.plaster} position={[0, 0, -INNER_FACADE.thickness]} receiveShadow />
      <mesh geometry={doorSurround} material={m.stone} receiveShadow />
      <mesh geometry={doorBead} material={m.stone} />
      {/* Dark marble threshold under the doors */}
      <mesh material={m.darkStone} position={[0, 0.02, -INNER_FACADE.thickness / 2]} receiveShadow>
        <boxGeometry args={[DOORWAY.halfWidth * 2, 0.04, INNER_FACADE.thickness]} />
      </mesh>

      {[-1, 1].map((side) => (
        <WallLantern key={side} position={[side * 3.3, 4.35, 0]} castLight={quality === "high" || side === -1} />
      ))}
      {[-1, 1].map((side) => (
        <Planter key={side} position={[side * 3.2, 0, 1.15]} seed={side} />
      ))}
    </group>
  );
}

/** Bronze lantern on a short bracket, with a warm point light inside. */
function WallLantern({ position, castLight }: { position: [number, number, number]; castLight: boolean }) {
  const m = useMuseumMaterials();
  const cap = useDisposable(() => new ConeGeometry(0.2, 0.16, 4, 1));
  return (
    <group position={position}>
      <mesh material={m.bronze} position={[0, 0, 0.03]}>
        <boxGeometry args={[0.16, 0.34, 0.06]} />
      </mesh>
      <mesh material={m.bronze} position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.32, 8]} />
      </mesh>
      <group position={[0, -0.02, 0.4]}>
        <mesh material={m.lanternGlass}>
          <boxGeometry args={[0.2, 0.34, 0.2]} />
        </mesh>
        {[
          [-1, -1],
          [1, -1],
          [-1, 1],
          [1, 1],
        ].map(([x, z]) => (
          <mesh key={`${x}${z}`} material={m.bronze} position={[x * 0.105, 0, z * 0.105]}>
            <boxGeometry args={[0.025, 0.38, 0.025]} />
          </mesh>
        ))}
        <mesh geometry={cap} material={m.bronze} position={[0, 0.25, 0]} rotation={[0, Math.PI / 4, 0]} />
        <mesh material={m.bronze} position={[0, -0.2, 0]}>
          <boxGeometry args={[0.24, 0.05, 0.24]} />
        </mesh>
        {castLight && <pointLight color="#ffb46a" intensity={5} distance={9} decay={2} />}
      </group>
    </group>
  );
}

/** A dark ceramic urn holding a fern; fronds are one instanced mesh. */
function Planter({ position, seed }: { position: [number, number, number]; seed: number }) {
  const m = useMuseumMaterials();
  const urn = useDisposable(
    () =>
      new LatheGeometry(
        [
          [0.0, 0],
          [0.22, 0],
          [0.26, 0.06],
          [0.3, 0.35],
          [0.36, 0.7],
          [0.37, 0.8],
          [0.33, 0.84],
          [0.32, 0.8],
          [0.0, 0.8],
        ].map(([x, y]) => new Vector2(x, y)),
        28,
      ),
  );
  const frond = useDisposable(() => {
    const g = new PlaneGeometry(0.42, 1.15, 1, 8);
    g.translate(0, 0.575, 0);
    const pos = g.getAttribute("position");
    // Arch each frond outward and let its tip droop.
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      pos.setZ(i, (y * y) * 0.42);
      pos.setY(i, y - y * y * 0.18);
    }
    g.computeVertexNormals();
    return g;
  });
  const soil = useDisposable(() => new CylinderGeometry(0.31, 0.31, 0.02, 20));
  const fronds = useMemo<InstanceTransform[]>(() => {
    const items: InstanceTransform[] = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = i * 2.39996 + seed;
      const tilt = 0.25 + (i % 3) * 0.18;
      const s = 0.8 + ((i * 37) % 10) / 25;
      items.push({ position: [0, 0.78, 0], rotation: [tilt, angle, 0], scale: [s, s, s] });
    }
    return items;
  }, [seed]);
  return (
    <group position={position}>
      <mesh geometry={urn} material={m.ceramic} castShadow receiveShadow />
      <mesh geometry={soil} material={m.darkStone} position={[0, 0.79, 0]} />
      <InstancedParts geometry={frond} material={m.frond} transforms={fronds} />
    </group>
  );
}
