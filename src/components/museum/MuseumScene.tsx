"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { paintings } from "@/content/paintings";
import type { QualityTier } from "@/lib/museum/deviceTier";
import type { MotionStore } from "@/lib/museum/motion";
import { PORTICO } from "@/lib/museum/layout";
import { MaterialsProvider } from "./materials";
import { AimedSpotLight } from "./helpers";
import { MuseumCamera, MotionInvalidator } from "./MuseumCamera";
import { MarbleFloor } from "./MarbleFloor";
import { Entrance } from "./Entrance";
import { DoubleDoors } from "./DoubleDoors";
import { GalleryCorridor } from "./GalleryCorridor";
import { GalleryPainting } from "./GalleryPainting";

const NIGHT = "#110c08";

/** Composes the museum: lighting, architecture, doors, paintings and camera. */
export function MuseumScene({ store, quality }: { store: MotionStore; quality: QualityTier }) {
  return (
    <MaterialsProvider>
      <color attach="background" args={[NIGHT]} />
      <fog attach="fog" args={[NIGHT, 34, 95]} />

      {/* Soft image-based fill rendered once from a few warm light panels — no HDR download. */}
      <Environment resolution={64} frames={1} environmentIntensity={0.42}>
        <Lightformer form="rect" intensity={2.2} color="#ffe2b8" scale={[20, 6, 1]} position={[0, 9, 0]} rotation={[Math.PI / 2, 0, 0]} />
        <Lightformer form="rect" intensity={0.8} color="#ffcf98" scale={[10, 4, 1]} position={[-8, 3, 0]} rotation={[0, Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={0.8} color="#ffcf98" scale={[10, 4, 1]} position={[8, 3, 0]} rotation={[0, -Math.PI / 2, 0]} />
        <Lightformer form="rect" intensity={0.4} color="#c8b49a" scale={[20, 3, 1]} position={[0, 2, 9]} />
      </Environment>
      <hemisphereLight args={["#ffe8cc", "#2a1c12", 0.32]} />

      {/* Warm downlight washing the doors from above the portico. */}
      <AimedSpotLight
        aim={[0, 2.6, -1]}
        position={[0, 11, PORTICO.depth + 6]}
        color="#ffcf92"
        intensity={420}
        angle={0.42}
        penumbra={0.85}
        distance={30}
        decay={2}
        castShadow={quality === "high"}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
      />

      <MuseumCamera store={store} />
      <MotionInvalidator store={store} />

      <MarbleFloor quality={quality} />
      <Entrance quality={quality} />
      <DoubleDoors store={store} />
      <GalleryCorridor quality={quality} />
      {paintings.map((painting) => (
        <GalleryPainting key={painting.id} painting={painting} quality={quality} />
      ))}
    </MaterialsProvider>
  );
}
