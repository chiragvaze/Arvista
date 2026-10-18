"use client";

import type { QualityTier } from "@/lib/museum/deviceTier";
import type { PaintingLayout } from "@/lib/museum/galleryLayout";
import { CORRIDOR, PAINTING_CENTER_HEIGHT } from "@/lib/museum/layout";
import { ErrorBoundary } from "./ErrorBoundary";
import { AimedSpotLight, NotReflected } from "./helpers";
import { useMuseumMaterials } from "./materials";
import { PaintingFrame } from "./PaintingFrame";
import { PaintingArtwork, UnavailableArtwork } from "./PaintingArtwork";

/**
 * Picture light, in the painting's local space (+Z points into the corridor):
 * a spotlight hung just below the opposite wall's cornice, 0.42 m out from that
 * wall. Lighting from across the room is a classic museum arrangement: the frame
 * is lit evenly and casts only a short, soft drop shadow.
 */
const LIGHT_POSITION: [number, number, number] = [0, CORRIDOR.wallHeight - 0.2 - PAINTING_CENTER_HEIGHT, CORRIDOR.halfWidth * 2 - 0.42];
const LIGHT_PITCH = Math.atan2(LIGHT_POSITION[1], LIGHT_POSITION[2]);

/**
 * One painting, hung where the gallery layout places it, with its own picture
 * light (no shadow map: the frame's drop shadow is a static soft decal, which
 * looks the same and keeps the shaders small). The frame never depends on the image: while the image loads the frame
 * holds bare canvas, and if it fails a labelled stand-in appears, so one
 * missing file never breaks the rest of the gallery.
 */
export function GalleryPainting({ layout, quality }: { layout: PaintingLayout; quality: QualityTier }) {
  const m = useMuseumMaterials();
  const { painting, position, rotationY, frame } = layout;
  const src = quality === "low" && painting.image.srcSmall ? painting.image.srcSmall : painting.image.src;
  const { artWidth: w, artHeight: h, artOffsetY: y } = frame;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Soft drop shadow: the light comes from across the corridor and above, so it falls slightly low. */}
      <NotReflected>
        <mesh material={m.frameShadow} position={[0, -0.07, 0.004]} scale={[frame.outerWidth + 0.34, frame.outerHeight + 0.34, 1]}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      </NotReflected>
      <PaintingFrame frame={frame} castShadow={false} />
      <ErrorBoundary fallback={<UnavailableArtwork width={w} height={h} offsetY={y} title={painting.title} />}>
        <PaintingArtwork src={src} width={w} height={h} offsetY={y} />
      </ErrorBoundary>
      <PictureLight />
    </group>
  );
}

function PictureLight() {
  const m = useMuseumMaterials();
  return (
    <>
      {/* Antique-brass can on a short stem, tilted down toward the painting (too small to matter in the reflection) */}
      <NotReflected>
        <group position={LIGHT_POSITION}>
          <mesh material={m.brass} position={[0, 0.09, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.18, 6]} />
          </mesh>
          <group rotation={[-Math.PI / 2 - LIGHT_PITCH, 0, 0]}>
            <mesh material={m.brass}>
              <cylinderGeometry args={[0.065, 0.075, 0.24, 16]} />
            </mesh>
            <mesh material={m.fixtureLens} position={[0, 0.121, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.055, 16]} />
            </mesh>
          </group>
        </group>
      </NotReflected>
      <AimedSpotLight
        aim={[0, -0.05, 0]}
        position={LIGHT_POSITION}
        color="#fff0d8"
        intensity={360}
        angle={0.24}
        penumbra={0.7}
        distance={18}
        decay={2}
      />
    </>
  );
}
