"use client";

import { useEffect, useMemo } from "react";
import { frameRingGeometry } from "@/lib/museum/geometry";
import type { FrameLayout } from "@/lib/museum/galleryLayout";
import { useMuseumMaterials } from "./materials";
import { NotReflected } from "./helpers";

/** Depths in metres, measured out from the wall (z = 0). */
export const FRAME_DEPTH = {
  /** The painted surface, recessed behind the mat. */
  artwork: 0.045,
  mat: 0.05,
} as const;

const MAT_CORE = 0.007;

/**
 * The moulding profile from the outside in, as [width, front face z, bevel]:
 * a raised outer lip, a broad rounded face and a lower inner step, so the frame
 * reads as layered carved walnut under the picture light. Each ring tucks 4 mm
 * under its outer neighbour, so no two side faces coincide and no gap opens.
 */
const PROFILE = {
  lip: [0.026, 0.14, 0.009],
  face: [0.054, 0.118, 0.02],
  step: [0.04, 0.094, 0.01],
  /** Antique-gold sight edge lying on the mat at the window. */
  fillet: [0.02, 0.08, 0.006],
} as const;
const TUCK = 0.004;

/** A frame ring whose front face sits at `front` (frameRingGeometry extrudes from -bevel to depth + bevel). */
function ring(width: number, height: number, band: number, front: number, bevel: number) {
  const depth = 0.03;
  return { geometry: frameRingGeometry(width, height, band, depth, bevel), z: front - depth - bevel };
}

/**
 * A dark walnut museum frame: a stepped moulding, a fine antique-gold sight
 * edge and an ivory linen mat, built around the artwork size from the gallery
 * layout. The mat is slightly deeper at the bottom. Drawn in the painting's
 * local space: the wall is z = 0 and the frame faces +Z.
 */
export function PaintingFrame({ frame, castShadow }: { frame: FrameLayout; castShadow: boolean }) {
  const m = useMuseumMaterials();
  const { artWidth, artHeight, mat, artOffsetY, outerWidth, outerHeight } = frame;
  const windowW = artWidth + mat * 2;
  const windowH = artHeight + mat * 2;

  const rings = useMemo(() => {
    const [lipW, lipZ, lipB] = PROFILE.lip;
    const [faceW, faceZ, faceB] = PROFILE.face;
    const [stepW, stepZ, stepB] = PROFILE.step;
    const [filletW, filletZ, filletB] = PROFILE.fillet;
    const stepInner = { w: windowW, h: windowH };
    const faceInner = { w: windowW + stepW * 2, h: windowH + stepW * 2 };
    const lipInner = { w: outerWidth - lipW * 2, h: outerHeight - lipW * 2 };
    return {
      lip: ring(lipInner.w, lipInner.h, lipW, lipZ, lipB),
      face: ring(faceInner.w, faceInner.h, faceW + TUCK, faceZ, faceB),
      step: ring(stepInner.w, stepInner.h, stepW + TUCK, stepZ, stepB),
      fillet: ring(windowW - filletW * 2, windowH - filletW * 2, filletW + TUCK, filletZ, filletB),
    };
  }, [windowW, windowH, outerWidth, outerHeight]);
  const matGeometries = useMemo(
    () => ({
      // The window is cut off-centre: the artwork sits `artOffsetY` above centre.
      mat: frameRingGeometry(artWidth, artHeight, mat, 0.02, 0.003, artOffsetY),
      core: frameRingGeometry(artWidth, artHeight, MAT_CORE, 0.022, 0.002),
    }),
    [artWidth, artHeight, mat, artOffsetY],
  );
  useEffect(
    () => () => {
      Object.values(rings).forEach((r) => r.geometry.dispose());
      Object.values(matGeometries).forEach((g) => g.dispose());
    },
    [rings, matGeometries],
  );

  return (
    <group>
      <mesh geometry={rings.lip.geometry} material={m.frameWoodDark} position={[0, 0, rings.lip.z]} castShadow={castShadow} />
      <mesh geometry={rings.face.geometry} material={m.frameWood} position={[0, 0, rings.face.z]} castShadow={castShadow} />
      <mesh geometry={matGeometries.mat} material={m.mat} position={[0, 0, FRAME_DEPTH.mat]} receiveShadow />
      {/* Fine detail that would not register in the floor's blurred reflection */}
      <NotReflected>
        {/* Backing board closing the gap between frame and wall */}
        <mesh material={m.darkStone} position={[0, 0, 0.02]}>
          <boxGeometry args={[outerWidth - 0.04, outerHeight - 0.04, 0.04]} />
        </mesh>
        <mesh geometry={rings.step.geometry} material={m.frameWoodDark} position={[0, 0, rings.step.z]} />
        <mesh geometry={rings.fillet.geometry} material={m.frameGold} position={[0, 0, rings.fillet.z]} />
        <mesh geometry={matGeometries.core} material={m.matCore} position={[0, artOffsetY, FRAME_DEPTH.mat]} />
      </NotReflected>
    </group>
  );
}
