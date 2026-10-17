"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { DOORWAY } from "@/lib/museum/layout";
import { bevelledPanelGeometry, doorLeafGeometry } from "@/lib/museum/geometry";
import type { MotionStore } from "@/lib/museum/motion";
import { useMuseumMaterials } from "./materials";
import { useDisposable } from "./helpers";

const GAP = 0.008;
const T = DOORWAY.leafThickness;
const LEAF_W = DOORWAY.halfWidth - GAP;

/** Raised panels as [centre x from hinge, centre y, width, height]. */
const PANELS: [number, number, number, number][] = [
  [LEAF_W / 2, 1.05, LEAF_W - 0.56, 1.3],
  [LEAF_W / 2, 3.55, LEAF_W - 0.56, 3.1],
  [LEAF_W / 2 + 0.35, 6.15, LEAF_W - 1.26, 1.25],
];

/**
 * Two arched leaves hung on the interior face of the inner facade. Each leaf is
 * parented to a hinge group placed exactly on its hinge axis, so a rotation about
 * Y swings it naturally into the building. Rotation is the only animated value
 * and is written in one place (useFrame) from the shared scroll state.
 */
export function DoubleDoors({ store }: { store: MotionStore }) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);

  useFrame(() => {
    const angle = store.values.doorOpen * DOORWAY.maxOpenAngle;
    // Positive Y rotation swings the left leaf's free edge toward -Z (inward); the right leaf mirrors it.
    if (left.current) left.current.rotation.y = angle;
    if (right.current) right.current.rotation.y = -angle;
  });

  return (
    <group>
      <group ref={left} position={[-DOORWAY.halfWidth, 0, DOORWAY.hingeZ]}>
        <DoorLeaf side={1} />
      </group>
      <group ref={right} position={[DOORWAY.halfWidth, 0, DOORWAY.hingeZ]}>
        <DoorLeaf side={-1} />
      </group>
    </group>
  );
}

function DoorLeaf({ side }: { side: 1 | -1 }) {
  const m = useMuseumMaterials();
  const leaf = useDisposable(
    () => doorLeafGeometry({ halfWidth: DOORWAY.halfWidth, spring: DOORWAY.spring, thickness: T, side, gap: GAP }),
  );
  const panels = useDisposable(() => {
    const items = PANELS.map(([, , w, h]) => bevelledPanelGeometry(w, h, 0.025, 0.022));
    return { items, dispose: () => items.forEach((g) => g.dispose()) };
  });

  const handleX = side * (LEAF_W - 0.17);
  return (
    <group>
      <mesh geometry={leaf} material={m.wood} castShadow receiveShadow />
      {PANELS.map(([x, y], i) => (
        <group key={i}>
          {/* Outside face (+Z) */}
          <mesh geometry={panels.items[i]} material={m.wood} position={[side * x, y, T]} castShadow />
          {/* Inside face (-Z), visible once the doors are open */}
          <mesh geometry={panels.items[i]} material={m.wood} position={[side * x, y, 0]} rotation={[0, Math.PI, 0]} />
        </group>
      ))}
      {/* Tall brass pull handles on both faces near the meeting edge */}
      {[T + 0.075, -0.075].map((z) => (
        <group key={z} position={[handleX, 1.5, z]}>
          <mesh material={m.brass}>
            <cylinderGeometry args={[0.022, 0.022, 1.0, 12]} />
          </mesh>
          {[-0.4, 0.4].map((y) => (
            <mesh key={y} material={m.brass} position={[0, y, z > 0 ? -0.04 : 0.04]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.013, 0.013, 0.08, 8]} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Hinge knuckles on the interior face */}
      {[0.9, 3.4, 5.2].map((y) => (
        <mesh key={y} material={m.bronze} position={[0, y, -0.02]}>
          <cylinderGeometry args={[0.035, 0.035, 0.3, 10]} />
        </mesh>
      ))}
    </group>
  );
}
