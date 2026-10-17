"use client";

import { Suspense } from "react";
import type { QualityTier } from "@/lib/museum/deviceTier";
import type { PaintingLayout } from "@/lib/museum/galleryLayout";
import { ErrorBoundary } from "./ErrorBoundary";
import { AimedSpotLight } from "./helpers";
import { PaintingFrame } from "./PaintingFrame";
import { PaintingArtwork, UnavailableArtwork, useArtworkTexture } from "./PaintingArtwork";

/**
 * One painting, hung where the gallery layout places it, with its own picture
 * light. The frame never depends on the image: while the image loads the frame
 * holds bare canvas, and if it fails a labelled stand-in appears, so one
 * missing file never breaks the rest of the gallery.
 */
export function GalleryPainting({ layout, quality }: { layout: PaintingLayout; quality: QualityTier }) {
  const { painting, position, rotationY, frame } = layout;
  const src = quality === "low" && painting.image.srcSmall ? painting.image.srcSmall : painting.image.src;
  const shadows = quality === "high";

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <PaintingFrame frame={frame} castShadow={shadows} />
      <ErrorBoundary fallback={<UnavailableArtwork width={frame.artWidth} height={frame.artHeight} title={painting.title} />}>
        <Suspense fallback={<PaintingArtwork width={frame.artWidth} height={frame.artHeight} texture={null} />}>
          <LoadedArtwork src={src} width={frame.artWidth} height={frame.artHeight} />
        </Suspense>
      </ErrorBoundary>
      <PictureLight castShadow={shadows} />
    </group>
  );
}

function LoadedArtwork({ src, width, height }: { src: string; width: number; height: number }) {
  const texture = useArtworkTexture(src);
  return <PaintingArtwork width={width} height={height} texture={texture} />;
}

/** A ceiling-mounted spotlight aimed at the painting, in the painting's local space (+Z is into the corridor). */
function PictureLight({ castShadow }: { castShadow: boolean }) {
  return (
    <AimedSpotLight
      aim={[0, -0.1, 0]}
      position={[0, 4.1, 3.1]}
      color="#fff0d8"
      intensity={85}
      angle={0.42}
      penumbra={0.75}
      distance={12}
      decay={2}
      castShadow={castShadow}
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0004}
      shadow-normalBias={0.02}
    />
  );
}
