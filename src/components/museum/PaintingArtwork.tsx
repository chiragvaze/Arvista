"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader, type Texture } from "three";
import { createUnavailableTexture, getPrimedCanvasTexture } from "@/lib/museum/textures";
import { FRAME_DEPTH } from "./PaintingFrame";
import { useDisposable } from "./helpers";

/**
 * The painted surface. The photograph is shown exactly as supplied: an unlit
 * material with tone mapping and fog disabled, so its colours reach the screen
 * unchanged. The museum lights the frame, mat and wall around it instead.
 * It shows bare primed canvas until the image has loaded (suspends inside).
 */
export function PaintingArtwork({
  width,
  height,
  offsetY = 0,
  src,
}: {
  width: number;
  height: number;
  offsetY?: number;
  src: string;
}) {
  return (
    <mesh position={[0, offsetY, FRAME_DEPTH.artwork]}>
      <planeGeometry args={[width, height]} />
      {/* While loading, a 1 x 1 primed-canvas texture stands in. Only the map changes when the image arrives, never
          the material: replacing it would free the shader program compiled behind the loading screen, which the
          browser may still be compiling (ANGLE then warns "glGetProgramiv: Program object expected"). */}
      <meshBasicMaterial map={getPrimedCanvasTexture()} toneMapped={false} fog={false}>
        <Suspense fallback={null}>
          <ArtworkMap src={src} />
        </Suspense>
      </meshBasicMaterial>
    </mesh>
  );
}

/** The loaded image, attached as the material's map (the primed canvas comes back if it is removed). */
function ArtworkMap({ src }: { src: string }) {
  const texture = useArtworkTexture(src);
  return <primitive object={texture} attach="map" />;
}

/** Shown in place of a painting whose image failed to load. */
export function UnavailableArtwork({
  width,
  height,
  offsetY = 0,
  title,
}: {
  width: number;
  height: number;
  offsetY?: number;
  title: string;
}) {
  const texture = useDisposable(() => createUnavailableTexture(title, width / height));
  return (
    <mesh position={[0, offsetY, FRAME_DEPTH.artwork]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={texture} roughness={0.95} />
    </mesh>
  );
}

/** Loads an artwork image (suspends until ready). */
export function useArtworkTexture(src: string): Texture {
  const loaded = useLoader(TextureLoader, src);
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy());
  // The loader caches its texture per URL, so configure a clone (sharing the same image) rather than the cached instance.
  const texture = useMemo(() => {
    const t = loaded.clone();
    t.colorSpace = SRGBColorSpace;
    t.anisotropy = Math.min(8, maxAnisotropy);
    t.needsUpdate = true;
    return t;
  }, [loaded, maxAnisotropy]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}
