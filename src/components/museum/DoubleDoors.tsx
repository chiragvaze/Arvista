"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group, SpotLight } from "three";
import { DOORWAY, CORRIDOR } from "@/lib/museum/layout";
import { bevelledPanelGeometry, doorHeadPanelGeometry, doorLeafGeometry, frameRingGeometry } from "@/lib/museum/geometry";
import type { MotionStore } from "@/lib/museum/motion";
import { useMuseumMaterials } from "./materials";
import { AimedSpotLight, NotReflected, useDisposable } from "./helpers";

const GAP = 0.008;
const T = DOORWAY.leafThickness;
const LEAF_W = DOORWAY.halfWidth - GAP;
/** Margin between panels and the leaf's stiles, rails and arch. */
const INSET = 0.3;
const PANEL_W = LEAF_W - INSET * 2;
const MOULD = 0.06;

/** Rectangular raised panels as [centre y, height]; the arched head panel sits above them. */
const PANELS: [number, number][] = [
  [1.05, 1.3],
  [3.3, 2.6],
];
const HEAD_PANEL_BOTTOM = 4.95;

/**
 * Two arched leaves hung on the interior face of the inner facade. Each leaf is
 * parented to a hinge group placed exactly on its hinge axis, so a rotation about
 * Y swings it naturally into the building. Rotation is the only animated value
 * and is written in one place (useFrame) from the shared scroll state.
 */
export function DoubleDoors({ store }: { store: MotionStore }) {
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  const spill = useRef<SpotLight>(null);
  const lastOpen = useRef(-1);

  useFrame(({ gl }) => {
    const open = store.values.doorOpen;
    const angle = open * DOORWAY.maxOpenAngle;
    // Positive Y rotation swings the left leaf's free edge toward -Z (inward); the right leaf mirrors it.
    if (left.current) left.current.rotation.y = angle;
    if (right.current) right.current.rotation.y = -angle;
    // Warm light from the porch spills across the gallery floor as the doors open.
    if (spill.current) spill.current.intensity = SPILL_INTENSITY * Math.min(1, open * 1.4);
    // Shadow maps are only re-rendered when something that casts a shadow has moved.
    if (open !== lastOpen.current) {
      lastOpen.current = open;
      gl.shadowMap.needsUpdate = true;
    }
  });

  return (
    <group>
      <group ref={left} position={[-DOORWAY.halfWidth, 0, DOORWAY.hingeZ]}>
        <DoorLeaf side={1} />
      </group>
      <group ref={right} position={[DOORWAY.halfWidth, 0, DOORWAY.hingeZ]}>
        <DoorLeaf side={-1} />
      </group>
      <AimedSpotLight
        ref={spill}
        aim={[0, 0, CORRIDOR.startZ - 9]}
        position={[0, 5.2, 2.6]}
        color="#ffcf9a"
        intensity={0}
        angle={0.36}
        penumbra={0.9}
        distance={22}
        decay={2}
      />
    </group>
  );
}

const SPILL_INTENSITY = 90;

function DoorLeaf({ side }: { side: 1 | -1 }) {
  const m = useMuseumMaterials();
  const leaf = useDisposable(
    () => doorLeafGeometry({ halfWidth: DOORWAY.halfWidth, spring: DOORWAY.spring, thickness: T, side, gap: GAP }),
  );
  const parts = useDisposable(() => {
    // Raised fields with a broad bevel, which catches the porch light as a bright edge, as on the reference doors.
    const panels = PANELS.map(([, h]) => bevelledPanelGeometry(PANEL_W, h, 0.03, 0.04));
    // Bolection moulding framing each raised panel.
    const mouldings = PANELS.map(([, h]) => frameRingGeometry(PANEL_W, h, MOULD, 0.03, 0.016));
    const head = doorHeadPanelGeometry({
      halfWidth: DOORWAY.halfWidth,
      spring: DOORWAY.spring,
      side,
      inset: INSET,
      bottom: HEAD_PANEL_BOTTOM,
      depth: 0.03,
      bevel: 0.04,
    });
    const all = [...panels, ...mouldings, head];
    return { panels, mouldings, head, dispose: () => all.forEach((g) => g.dispose()) };
  });

  const panelX = side * (INSET + PANEL_W / 2);
  const handleX = side * (LEAF_W - 0.17);
  return (
    <group>
      <mesh geometry={leaf} material={m.wood} castShadow receiveShadow />
      {PANELS.map(([y], i) => (
        <group key={i}>
          {/* Outside face (+Z) */}
          <mesh geometry={parts.panels[i]} material={m.wood} position={[panelX, y, T]} castShadow />
          <mesh geometry={parts.mouldings[i]} material={m.wood} position={[panelX, y, T + 0.012]} />
          {/* Inside face (-Z), visible once the doors are open */}
          <mesh geometry={parts.panels[i]} material={m.wood} position={[panelX, y, 0]} rotation={[0, Math.PI, 0]} />
          <mesh geometry={parts.mouldings[i]} material={m.wood} position={[panelX, y, -0.012]} rotation={[0, Math.PI, 0]} />
        </group>
      ))}
      {/* Arched head panels, outside and inside */}
      <mesh geometry={parts.head} material={m.wood} position={[0, 0, T]} />
      <mesh geometry={parts.head} material={m.wood} position={[0, 0, 0]} scale={[1, 1, -1]} />
      {/* Slender brass and bronze hardware: seen by the visitor, left out of the floor's reflection. */}
      <NotReflected>
        {side === -1 && (
          // Brass meeting strip on the right leaf covers the gap between the leaves on the outside.
          <mesh material={m.brass} position={[side * LEAF_W + 0.006, 3.95, T + 0.008]}>
            <boxGeometry args={[0.036, 7.9, 0.016]} />
          </mesh>
        )}
        {/* Antique-brass pulls on long backplates with finials, on both faces near the meeting edge */}
        {[1, -1].map((face) => (
          <group key={face} position={[handleX, 1.55, face > 0 ? T : 0]}>
            <mesh material={m.brass} position={[0, 0, face * 0.007]}>
              <boxGeometry args={[0.08, 1.24, 0.014]} />
            </mesh>
            {[-0.66, 0.66].map((y) => (
              <mesh key={y} material={m.brass} position={[0, y, face * 0.012]}>
                <sphereGeometry args={[0.032, 12, 8]} />
              </mesh>
            ))}
            <mesh material={m.brass} position={[0, 0, face * 0.08]}>
              <cylinderGeometry args={[0.023, 0.023, 0.86, 16]} />
            </mesh>
            {[-0.36, 0.36].map((y) => (
              <mesh key={y} material={m.brass} position={[0, y, face * 0.045]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.014, 0.018, 0.075, 10]} />
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
      </NotReflected>
    </group>
  );
}
