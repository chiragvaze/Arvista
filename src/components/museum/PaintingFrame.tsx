"use client";

import { useEffect, useMemo } from "react";
import { frameRingGeometry } from "@/lib/museum/geometry";
import { useMuseumMaterials } from "./materials";

/** Moulding proportions in metres. */
export const FRAME = {
  liner: 0.075,
  moulding: 0.15,
  /** Distance from the wall to the painted surface. */
  artworkZ: 0.05,
} as const;

/**
 * A gilded museum frame with a linen liner and a fine gold fillet, sized around
 * an artwork of `width` x `height` metres. Drawn in the painting's local space:
 * the wall is the z = 0 plane and the frame faces +Z.
 */
export function PaintingFrame({ width, height, castShadow }: { width: number; height: number; castShadow: boolean }) {
  const m = useMuseumMaterials();
  const linedW = width + FRAME.liner * 2;
  const linedH = height + FRAME.liner * 2;

  const { moulding, liner, fillet } = useMemo(
    () => ({
      moulding: frameRingGeometry(width + FRAME.liner * 2, height + FRAME.liner * 2, FRAME.moulding, 0.07, 0.032),
      liner: frameRingGeometry(width, height, FRAME.liner, 0.03, 0.006),
      fillet: frameRingGeometry(width, height, 0.014, 0.034, 0.004),
    }),
    [width, height],
  );
  useEffect(
    () => () => {
      moulding.dispose();
      liner.dispose();
      fillet.dispose();
    },
    [moulding, liner, fillet],
  );
  const outerW = linedW + FRAME.moulding * 2;
  const outerH = linedH + FRAME.moulding * 2;

  return (
    <group>
      {/* Backing board closing the gap between frame and wall */}
      <mesh material={m.darkStone} position={[0, 0, 0.02]}>
        <boxGeometry args={[outerW - 0.04, outerH - 0.04, 0.04]} />
      </mesh>
      <mesh geometry={moulding} material={m.frameGold} position={[0, 0, 0.035]} castShadow={castShadow} />
      <mesh geometry={liner} material={m.frameLiner} position={[0, 0, 0.034]} />
      <mesh geometry={fillet} material={m.frameGold} position={[0, 0, 0.034]} />
    </group>
  );
}
