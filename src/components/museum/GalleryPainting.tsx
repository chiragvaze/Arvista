"use client";

import { Suspense } from "react";
import type { Painting } from "@/types/artwork";
import type { QualityTier } from "@/lib/museum/deviceTier";
import { paintingPlacement } from "@/lib/museum/layout";
import { ErrorBoundary } from "./ErrorBoundary";
import { AimedSpotLight } from "./helpers";
import { PaintingFrame } from "./PaintingFrame";
import { PaintingArtwork, useArtworkTexture } from "./PaintingArtwork";

const DEFAULT_DISPLAY_HEIGHT = 1.8;

/**
 * A painting hung on the corridor wall at the position its hanging order
 * dictates, with its own picture light. If the image is still loading or fails,
 * the frame still hangs with blank canvas so the scene never goes empty.
 */
export function GalleryPainting({ painting, quality }: { painting: Painting; quality: QualityTier }) {
  const { position, rotationY } = paintingPlacement(painting.order, painting.wall);
  const height = painting.displayHeight ?? DEFAULT_DISPLAY_HEIGHT;
  const declaredAspect = painting.image.width / painting.image.height;
  const shadows = quality === "high";
  const blank = <FramedArtwork height={height} aspect={declaredAspect} castShadow={shadows} />;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <ErrorBoundary fallback={blank}>
        <Suspense fallback={blank}>
          <LoadedArtwork src={painting.image.src} height={height} castShadow={shadows} />
        </Suspense>
      </ErrorBoundary>
      <PictureLight castShadow={shadows} />
    </group>
  );
}

function LoadedArtwork({ src, height, castShadow }: { src: string; height: number; castShadow: boolean }) {
  const { texture, aspect } = useArtworkTexture(src);
  return <FramedArtwork height={height} aspect={aspect} castShadow={castShadow} texture={texture} />;
}

function FramedArtwork({
  height,
  aspect,
  castShadow,
  texture = null,
}: {
  height: number;
  aspect: number;
  castShadow: boolean;
  texture?: Parameters<typeof PaintingArtwork>[0]["texture"];
}) {
  const width = height * aspect;
  return (
    <>
      <PaintingFrame width={width} height={height} castShadow={castShadow} />
      <PaintingArtwork width={width} height={height} texture={texture} />
    </>
  );
}

/** A ceiling-mounted spotlight aimed at the painting, in the painting's local space (+Z is into the corridor). */
function PictureLight({ castShadow }: { castShadow: boolean }) {
  return (
    <AimedSpotLight
      aim={[0, -0.1, 0]}
      position={[0, 4.1, 3.1]}
      color="#fff0d8"
      intensity={95}
      angle={0.42}
      penumbra={0.7}
      distance={12}
      decay={2}
      castShadow={castShadow}
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
  );
}
