"use client";

import { BackSide, BoxGeometry, CylinderGeometry, PlaneGeometry } from "three";
import { BENCH_BAY, CORRIDOR, VAULT_RADIUS, bayCenterZ, bayDividerZs } from "@/lib/museum/layout";
import { archBandGeometry, archedWallGeometry, scaleUVs } from "@/lib/museum/geometry";
import type { QualityTier } from "@/lib/museum/deviceTier";
import { useMuseumMaterials } from "./materials";
import { InstancedParts, useDisposable, type InstanceTransform } from "./helpers";

const LENGTH = CORRIDOR.startZ - CORRIDOR.endZ;
const MID_Z = (CORRIDOR.startZ + CORRIDOR.endZ) / 2;
const W = CORRIDOR.halfWidth;
const H = CORRIDOR.wallHeight;
const END_WALL_THICKNESS = 0.6;
const NEXT_HALL_DEPTH = 10;

const DIVIDERS = bayDividerZs();
/** Instance transforms for one element repeated at every bay divider on both walls. */
function onBothWalls(inset: number, y: number): InstanceTransform[] {
  return DIVIDERS.flatMap((z) => [{ position: [-W + inset, y, z] as const }, { position: [W - inset, y, z] as const }]);
}
const RIBS: InstanceTransform[] = DIVIDERS.map((z) => ({ position: [0, 0, z - 0.25] }));
const SKYLIGHTS: InstanceTransform[] = Array.from({ length: CORRIDOR.bayCount }, (_, i) => ({ position: [0, H, bayCenterZ(i)] }));
const PILASTERS = onBothWalls(0.11, H / 2);
const CAPITALS = onBothWalls(0.17, H - 0.16);
const BASES = onBothWalls(0.15, 0.2);

/**
 * The barrel-vaulted gallery corridor. Pilasters, vault ribs and skylights are
 * laid out per bay so new paintings and rooms can be added bay by bay.
 */
export function GalleryCorridor({ quality }: { quality: QualityTier }) {
  const m = useMuseumMaterials();

  const wall = useDisposable(() => scaleUVs(new PlaneGeometry(LENGTH, H), LENGTH, H));
  const vault = useDisposable(() => {
    const g = new CylinderGeometry(VAULT_RADIUS, VAULT_RADIUS, LENGTH, 64, 1, true, Math.PI / 2, Math.PI);
    g.rotateX(Math.PI / 2);
    return scaleUVs(g, Math.PI * VAULT_RADIUS, LENGTH);
  });
  const rib = useDisposable(() =>
    archBandGeometry({ innerHalfWidth: VAULT_RADIUS - 0.36, spring: H, band: 0.4, depth: 0.5, baseY: H }),
  );
  const skylight = useDisposable(() => {
    const g = new CylinderGeometry(VAULT_RADIUS - 0.02, VAULT_RADIUS - 0.02, 3.4, 12, 1, true, Math.PI - 0.34, 0.68);
    g.rotateX(Math.PI / 2);
    return g;
  });
  const pilaster = useDisposable(() => new BoxGeometry(0.22, H, 0.62));
  const capital = useDisposable(() => new BoxGeometry(0.34, 0.32, 0.82));
  const base = useDisposable(() => new BoxGeometry(0.3, 0.4, 0.78));
  const endWall = useDisposable(() =>
    archedWallGeometry({ width: W * 2, height: H + VAULT_RADIUS + 0.2, archHalfWidth: 2.2, archSpring: 4.2, depth: END_WALL_THICKNESS }),
  );

  const hallZ = CORRIDOR.endZ - END_WALL_THICKNESS;
  // Ambient corridor lights in alternate bays; each painting also has its own picture light.
  const lightBays = Array.from({ length: CORRIDOR.bayCount }, (_, i) => i).filter((i) => i % (quality === "high" ? 2 : 3) === 0);

  return (
    <group>
      <mesh geometry={wall} material={m.plaster} position={[-W, H / 2, MID_Z]} rotation={[0, Math.PI / 2, 0]} receiveShadow />
      <mesh geometry={wall} material={m.plaster} position={[W, H / 2, MID_Z]} rotation={[0, -Math.PI / 2, 0]} receiveShadow />
      <mesh geometry={vault} position={[0, H, MID_Z]}>
        <meshStandardMaterial
          color="#efe5d5"
          map={m.plaster.map}
          roughness={0.95}
          side={BackSide}
        />
      </mesh>

      <InstancedParts geometry={rib} material={m.stone} transforms={RIBS} />
      <InstancedParts geometry={skylight} material={m.skylight} transforms={SKYLIGHTS} />
      <InstancedParts geometry={pilaster} material={m.stone} transforms={PILASTERS} receiveShadow />
      <InstancedParts geometry={capital} material={m.stone} transforms={CAPITALS} />
      <InstancedParts geometry={base} material={m.darkStone} transforms={BASES} />

      {[-1, 1].map((side) => (
        <group key={side}>
          {/* Cornice at the springing line of the vault */}
          <mesh material={m.stone} position={[side * (W - 0.18), H, MID_Z]}>
            <boxGeometry args={[0.36, 0.26, LENGTH]} />
          </mesh>
          {/* Dark marble skirting */}
          <mesh material={m.darkStone} position={[side * (W - 0.03), 0.12, MID_Z]}>
            <boxGeometry args={[0.06, 0.24, LENGTH]} />
          </mesh>
        </group>
      ))}

      {lightBays.map((bay) => (
        // Hung below the springing line so the walls, cornice and vault are all lit from inside the volume.
        <pointLight key={bay} position={[0, H - 0.9, bayCenterZ(bay)]} color="#ffe6c4" intensity={60} distance={26} decay={2} />
      ))}

      <Bench position={[0, 0, bayCenterZ(BENCH_BAY)]} />

      {/* End wall with an archway into the next hall (a later phase). */}
      <mesh geometry={endWall} material={m.plaster} position={[0, 0, hallZ]} />
      <NextHall z={hallZ} />
    </group>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  const m = useMuseumMaterials();
  return (
    <group position={position}>
      <mesh material={m.leather} position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.8, 0.12, 2.4]} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} material={m.wood} position={[0, 0.2, s * 0.95]}>
          <boxGeometry args={[0.7, 0.4, 0.12]} />
        </mesh>
      ))}
    </group>
  );
}

/** A warmly lit room seen through the end arch, hinting at the next gallery. */
function NextHall({ z }: { z: number }) {
  const m = useMuseumMaterials();
  const w = 6;
  const h = 8;
  const back = z - NEXT_HALL_DEPTH;
  const mid = z - NEXT_HALL_DEPTH / 2;
  return (
    <group>
      <mesh material={m.plaster} position={[0, h / 2, back]}>
        <planeGeometry args={[w * 2, h]} />
      </mesh>
      <mesh material={m.plaster} position={[-w, h / 2, mid]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[NEXT_HALL_DEPTH, h]} />
      </mesh>
      <mesh material={m.plaster} position={[w, h / 2, mid]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[NEXT_HALL_DEPTH, h]} />
      </mesh>
      <mesh material={m.plaster} position={[0, h, mid]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[w * 2, NEXT_HALL_DEPTH]} />
      </mesh>
      <pointLight position={[0, 5.5, mid]} color="#ffd9a8" intensity={45} distance={16} decay={2} />
    </group>
  );
}
