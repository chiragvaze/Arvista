"use client";

import { useLayoutEffect, useRef, type ComponentRef } from "react";
import { PlaneGeometry, type Material, type WebGLProgramParametersWithUniforms, type WebGLRenderer } from "three";
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

/** drei's reflector tints the floor's albedo by the reflection; this is the line that does it. */
const ALBEDO_TINT = "diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + newMerge.rgb * mixStrength);";

/**
 * Makes the planar reflection behave like a reflection on polished stone.
 * drei's reflector multiplies the floor's colour by the reflected image, so
 * reflections vanish wherever the floor is less lit and take on the marble's
 * colour. Instead the reflected light is added on top of the lit marble,
 * weighted by Fresnel reflectance (about 4% looking straight down, rising
 * toward grazing angles), so the floor reflects faintly underfoot and more
 * strongly down the corridor, as real marble does.
 */
function addReflectionAsSpecular(material: Material) {
  const original = material.onBeforeCompile.bind(material);
  material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {
    original(shader, renderer);
    if (!shader.fragmentShader.includes(ALBEDO_TINT)) return;
    shader.fragmentShader = shader.fragmentShader
      .replace(ALBEDO_TINT, "vec3 reflectedRadiance = newMerge.rgb * mixStrength;")
      .replace(
        "#include <opaque_fragment>",
        `float reflectionNdotV = saturate(dot(normal, normalize(vViewPosition)));
        float reflectionFresnel = 0.04 + 0.96 * pow(1.0 - reflectionNdotV, 5.0);
        outgoingLight += reflectedRadiance * reflectionFresnel;
        #include <opaque_fragment>`,
      );
  };
  material.customProgramCacheKey = () => "arvista-floor-reflection";
  material.needsUpdate = true;
}

/**
 * One continuous polished marble floor running from the forecourt through the
 * corridor, so inside and outside read as a single building. High tier adds a
 * softly blurred planar reflection; the low tier uses a glossy standard
 * material. Baked contact shadows ground the walls, the planters and the bench.
 */
export function MarbleFloor({ quality }: { quality: QualityTier }) {
  const { marbleMap } = useMuseumMaterials();
  const reflector = useRef<ComponentRef<typeof MeshReflectorMaterial>>(null);
  const length = NEAR_Z - FAR_Z;
  const geometry = useDisposable(() => scaleUVs(new PlaneGeometry(WIDTH, length), WIDTH / METRES_PER_REPEAT, length / METRES_PER_REPEAT));
  const ao = useDisposable(() =>
    fitToMetres(bakeFloor(WIDTH, NEAR_Z, FAR_Z, PLANTER_SPOTS), WIDTH / METRES_PER_REPEAT, length / METRES_PER_REPEAT),
  );
  // Patched before the first frame, so the shader is compiled once, with the change, during warm-up.
  useLayoutEffect(() => {
    if (reflector.current) addReflectionAsSpecular(reflector.current);
  }, [quality]);

  return (
    // The plane is laid flat by rotating the mesh, not the geometry: the reflector derives its mirror plane from the
    // mesh's rotation (it assumes the plane faces +Z), so a pre-rotated geometry made it mirror the scene in a
    // vertical plane and smear misplaced bands across the floor.
    <mesh geometry={geometry} position={[0, 0, (NEAR_Z + FAR_Z) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      {quality === "high" ? (
        <MeshReflectorMaterial
          ref={reflector}
          map={marbleMap}
          aoMap={ao}
          color="#d6c9b4"
          roughness={0.2}
          metalness={0}
          resolution={256}
          blur={[160, 60]}
          // Share of the blurred reflection, scaled by roughness: polished, not a mirror.
          mixBlur={2.4}
          mixStrength={1}
          mixContrast={1}
          mirror={0}
          // No depth-based blur: sampled from a low-resolution depth texture it smeared dark and bright streaks
          // across the floor toward the vanishing point.
          depthScale={0}
        />
      ) : (
        <meshStandardMaterial map={marbleMap} aoMap={ao} color="#d6c9b4" roughness={0.22} metalness={0} />
      )}
    </mesh>
  );
}
