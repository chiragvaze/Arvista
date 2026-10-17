"use client";

import { PlaneGeometry } from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import type { QualityTier } from "@/lib/museum/deviceTier";
import { scaleUVs } from "@/lib/museum/geometry";
import { CORRIDOR } from "@/lib/museum/layout";
import { useMuseumMaterials } from "./materials";
import { useDisposable } from "./helpers";

const WIDTH = 34;
const NEAR_Z = 30;
/** Runs past the end wall and under the next hall. */
const FAR_Z = CORRIDOR.endZ - 12;
/** One texture repeat holds 2 x 2 marble slabs of 1.5 m. */
const METRES_PER_REPEAT = 3;

/**
 * One continuous polished marble floor running from the forecourt through the
 * corridor, so inside and outside read as a single building. High tier uses a
 * blurred planar reflection; the low tier uses a glossy standard material.
 */
export function MarbleFloor({ quality }: { quality: QualityTier }) {
  const { marbleMap } = useMuseumMaterials();
  const length = NEAR_Z - FAR_Z;
  const geometry = useDisposable(() => {
    const g = new PlaneGeometry(WIDTH, length);
    g.rotateX(-Math.PI / 2);
    return scaleUVs(g, WIDTH / METRES_PER_REPEAT, length / METRES_PER_REPEAT);
  });

  return (
    <mesh geometry={geometry} position={[0, 0, (NEAR_Z + FAR_Z) / 2]} receiveShadow>
      {quality === "high" ? (
        <MeshReflectorMaterial
          map={marbleMap}
          color="#d9cbb6"
          roughness={0.32}
          metalness={0}
          resolution={512}
          blur={[320, 90]}
          mixBlur={0.9}
          mixStrength={1.4}
          mixContrast={1}
          mirror={0}
          depthScale={0.9}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.3}
        />
      ) : (
        <meshStandardMaterial map={marbleMap} color="#ddd0bc" roughness={0.22} metalness={0} />
      )}
    </mesh>
  );
}
