"use client";

import { useEffect, useMemo } from "react";
import { frameRingGeometry } from "@/lib/museum/geometry";
import { FRAME_PROFILE, type FrameLayout } from "@/lib/museum/galleryLayout";
import { useMuseumMaterials } from "./materials";

/** Depths in metres, measured out from the wall (z = 0). */
export const FRAME_DEPTH = {
  /** The painted surface, recessed behind the mat. */
  artwork: 0.045,
  mat: 0.05,
  moulding: 0.035,
} as const;

const FILLET = 0.018;
const MAT_CORE = 0.007;

/**
 * A dark walnut museum frame with a fine gold fillet and an ivory mat, built
 * around the artwork size from the gallery layout. The mat width varies per
 * painting so smaller canvases sit in frames of a consistent size.
 * Drawn in the painting's local space: the wall is z = 0 and the frame faces +Z.
 */
export function PaintingFrame({ frame, castShadow }: { frame: FrameLayout; castShadow: boolean }) {
  const m = useMuseumMaterials();
  const { artWidth, artHeight, mat, outerWidth, outerHeight } = frame;
  const windowW = artWidth + mat * 2;
  const windowH = artHeight + mat * 2;

  const geometries = useMemo(
    () => ({
      moulding: frameRingGeometry(windowW, windowH, FRAME_PROFILE.moulding, 0.07, 0.03),
      fillet: frameRingGeometry(windowW - FILLET * 2, windowH - FILLET * 2, FILLET, 0.03, 0.005),
      mat: frameRingGeometry(artWidth, artHeight, mat, 0.02, 0.003),
      core: frameRingGeometry(artWidth, artHeight, MAT_CORE, 0.022, 0.002),
    }),
    [artWidth, artHeight, mat, windowW, windowH],
  );
  useEffect(() => () => Object.values(geometries).forEach((g) => g.dispose()), [geometries]);

  return (
    <group>
      {/* Backing board closing the gap between frame and wall */}
      <mesh material={m.darkStone} position={[0, 0, 0.02]}>
        <boxGeometry args={[outerWidth - 0.04, outerHeight - 0.04, 0.04]} />
      </mesh>
      <mesh geometry={geometries.moulding} material={m.frameWood} position={[0, 0, FRAME_DEPTH.moulding]} castShadow={castShadow} />
      <mesh geometry={geometries.fillet} material={m.frameGold} position={[0, 0, FRAME_DEPTH.mat + 0.012]} />
      <mesh geometry={geometries.mat} material={m.mat} position={[0, 0, FRAME_DEPTH.mat]} receiveShadow />
      <mesh geometry={geometries.core} material={m.matCore} position={[0, 0, FRAME_DEPTH.mat]} />
    </group>
  );
}
