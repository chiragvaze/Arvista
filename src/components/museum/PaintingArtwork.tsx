"use client";

import { useEffect, useMemo } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import { SRGBColorSpace, TextureLoader, type Texture } from "three";
import { createUnavailableTexture } from "@/lib/museum/textures";
import { FRAME_DEPTH } from "./PaintingFrame";
import { useDisposable } from "./helpers";

/**
 * The painted surface. The photograph is shown exactly as supplied: an unlit
 * material with tone mapping and fog disabled, so its colours reach the screen
 * unchanged. The museum lights the frame, mat and wall around it instead.
 * Without a texture it shows bare primed canvas (while loading).
 */
export function PaintingArtwork({ width, height, texture }: { width: number; height: number; texture: Texture | null }) {
  return (
    <mesh position={[0, 0, FRAME_DEPTH.artwork]}>
      <planeGeometry args={[width, height]} />
      {texture ? (
        <meshBasicMaterial map={texture} toneMapped={false} fog={false} />
      ) : (
        <meshStandardMaterial color="#e4dccd" roughness={0.95} />
      )}
    </mesh>
  );
}

/** Shown in place of a painting whose image failed to load. */
export function UnavailableArtwork({ width, height, title }: { width: number; height: number; title: string }) {
  const texture = useDisposable(() => createUnavailableTexture(title, width / height));
  return (
    <mesh position={[0, 0, FRAME_DEPTH.artwork]}>
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
