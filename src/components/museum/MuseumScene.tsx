"use client";

import { useEffect, useState } from "react";
import { flushSync, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { galleryLayout } from "@/lib/museum/galleryLayout";
import type { QualityTier } from "@/lib/museum/deviceTier";
import type { MotionStore } from "@/lib/museum/motion";
import { PORTICO } from "@/lib/museum/layout";
import { MaterialsProvider } from "./materials";
import { ReflectionProbe } from "./ReflectionProbe";
import { AimedSpotLight, ContextRestorations } from "./helpers";
import { MuseumCamera, MotionInvalidator } from "./MuseumCamera";
import { MarbleFloor } from "./MarbleFloor";
import { Entrance } from "./Entrance";
import { DoubleDoors } from "./DoubleDoors";
import { GalleryCorridor } from "./GalleryCorridor";
import { GalleryPainting } from "./GalleryPainting";

const NIGHT = "#110c08";

/** Composes the museum: lighting, architecture, doors, paintings and camera. */
export function MuseumScene({ store, quality }: { store: MotionStore; quality: QualityTier }) {
  const restorations = useContextRestorations();
  return (
    <ContextRestorations.Provider value={restorations}>
      <MaterialsProvider>
        <color attach="background" args={[NIGHT]} />
        <fog attach="fog" args={[NIGHT, 34, 95]} />

        {/* Soft image-based fill rendered once from a few warm light panels — no HDR download. It lights the
            dusk-lit exterior stone, the mats and the palms; the corridor's stone has its own fill (useStoneFill).
            Keyed by restorations: drawn only once, so it is mounted afresh (and drawn again) after a context restore. */}
        <Environment key={restorations} resolution={64} frames={1} environmentIntensity={0.22}>
          <Lightformer form="rect" intensity={2.2} color="#ffe2b8" scale={[20, 6, 1]} position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <Lightformer form="rect" intensity={0.8} color="#ffcf98" scale={[10, 4, 1]} position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={0.8} color="#ffcf98" scale={[10, 4, 1]} position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]} />
          <Lightformer form="rect" intensity={0.4} color="#c8b49a" scale={[20, 3, 1]} position={[0, 2, 9]} />
          {/* Light bounced up from the pale marble floor */}
          <Lightformer form="rect" intensity={0.55} color="#e6d3b4" scale={[20, 20, 1]} position={[0, -3, 0]} rotation={[-Math.PI / 2, 0, 0]} />
        </Environment>
        {/* Sky: warm-white ceiling light. Ground: the bounce from the cream marble floor, which keeps the undersides
            of mouldings, cornices and dentils from falling to black. Kept low and only slightly warm: the walls and
            vault get their soft light from baked light maps, and an amber fill turns every shadow orange. */}
        <hemisphereLight args={["#fff0e0", "#a08f7a", 0.14]} />

        {/* Warm downlight from above the portico, washing the doors and the carved inscription above them. */}
        <AimedSpotLight
          aim={[0, 4.4, -0.5]}
          position={[0, 11, PORTICO.depth + 6]}
          color="#ffcf92"
          intensity={360}
          angle={0.52}
          penumbra={0.75}
          distance={30}
          decay={2}
          castShadow={quality === "high"}
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.0004}
          shadow-normalBias={0.03}
          shadow-radius={3}
        />

        <ReflectionProbe />
        <MuseumCamera store={store} />
        <MotionInvalidator store={store} />

        <MarbleFloor quality={quality} />
        <Entrance />
        <DoubleDoors store={store} />
        <GalleryCorridor />
        {galleryLayout.map((layout) => (
          <GalleryPainting key={layout.painting.id} layout={layout} quality={quality} />
        ))}
      </MaterialsProvider>
    </ContextRestorations.Provider>
  );
}

/**
 * Counts WebGL context restorations (see ContextRestorations). three restores its own state first (its listener
 * was added when the renderer was created); the count then changes synchronously, inside the same event, so the
 * cube maps and environment are drawn again before any frame can be. The shadow map, drawn on demand, is asked
 * for once more, and a frame is requested.
 */
function useContextRestorations(): number {
  const gl = useThree((s) => s.gl);
  const invalidate = useThree((s) => s.invalidate);
  const [restorations, setRestorations] = useState(0);
  useEffect(() => {
    const canvas = gl.domElement;
    const onRestored = () => {
      flushSync(() => setRestorations((n) => n + 1));
      gl.shadowMap.needsUpdate = true;
      invalidate();
    };
    canvas.addEventListener("webglcontextrestored", onRestored);
    return () => canvas.removeEventListener("webglcontextrestored", onRestored);
  }, [gl, invalidate]);
  return restorations;
}
