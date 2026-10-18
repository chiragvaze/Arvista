"use client";

import { PlaneGeometry } from "three";
import { MeshReflectorMaterial } from "@react-three/drei";
import type { QualityTier } from "@/lib/museum/deviceTier";
import { scaleUVs } from "@/lib/museum/geometry";
import { bakeFloor, fitToMetres } from "@/lib/museum/lightmaps";
import { CORRIDOR, PLANTER_SPOTS } from "@/lib/museum/layout";
import { useMuseumMaterials } from "./materials";
import { useDisposable } from "./helpers";

const WIDTH = 34;
const NEAR_Z = 30;
/** Runs past the end wall and under the apse. */
const FAR_Z = CORRIDOR.endZ - 12;
/** One texture repeat holds 2 x 2 marble slabs of 1.5 m. */
const METRES_PER_REPEAT = 3;

/**
 * One continuous polished marble floor running from the forecourt through the
 * corridor, so inside and outside read as a single building. High tier uses a
 * softly blurred planar reflection (polished, not a mirror); the low tier uses
 * a glossy standard material. Baked contact shadows ground the walls, the
 * planters and the bench.
 */
export function MarbleFloor({ quality }: { quality: QualityTier }) {
  const { marbleMap } = useMuseumMaterials();
  const length = NEAR_Z - FAR_Z;
  const geometry = useDisposable(() => {
    const g = new PlaneGeometry(WIDTH, length);
    g.rotateX(-Math.PI / 2);
    return scaleUVs(g, WIDTH / METRES_PER_REPEAT, length / METRES_PER_REPEAT);
  });
  const ao = useDisposable(() =>
    fitToMetres(bakeFloor(WIDTH, NEAR_Z, FAR_Z, PLANTER_SPOTS), WIDTH / METRES_PER_REPEAT, length / METRES_PER_REPEAT),
  );

  return (
    <mesh geometry={geometry} position={[0, 0, (NEAR_Z + FAR_Z) / 2]} receiveShadow>
      {quality === "high" ? (
        <MeshReflectorMaterial
          map={marbleMap}
          aoMap={ao}
          color="#d3c8b8"
          roughness={0.26}
          metalness={0}
          resolution={256}
          blur={[220, 70]}
          mixBlur={0.9}
          mixStrength={2.6}
          mixContrast={1.05}
          mirror={0}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
        />
      ) : (
        <meshStandardMaterial map={marbleMap} aoMap={ao} color="#d6cbbb" roughness={0.24} metalness={0} />
      )}
    </mesh>
  );
}
