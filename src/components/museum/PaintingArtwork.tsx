"use client";

import { useEffect, useMemo } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader, type Texture } from "three";
import { FRAME } from "./PaintingFrame";

/** The painted surface, recessed inside the frame. Without a texture it shows bare primed canvas. */
export function PaintingArtwork({ width, height, texture }: { width: number; height: number; texture: Texture | null }) {
  return (
    <mesh position={[0, 0, FRAME.artworkZ]} receiveShadow>
      <planeGeometry args={[width, height]} />
      {texture ? (
        <meshStandardMaterial map={texture} roughness={0.72} metalness={0} />
      ) : (
        <meshStandardMaterial color="#e4dccd" roughness={0.95} />
      )}
    </mesh>
  );
}

/**
 * Loads an artwork image (suspends until ready) and reports its true pixel size,
 * so frames are built around the real aspect ratio rather than a guess.
 */
export function useArtworkTexture(src: string): { texture: Texture; aspect: number } {
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
  const image = loaded.image;
  const aspect = image && image.naturalWidth > 0 ? image.naturalWidth / image.naturalHeight : 1;
  return { texture, aspect };
}
