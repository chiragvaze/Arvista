"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { Euler, InstancedMesh, Matrix4, Object3D, Quaternion, Vector3, type BufferGeometry, type Material } from "three";

/**
 * Creates a three.js resource once per component instance and frees its GPU
 * memory on unmount. (three re-uploads a disposed resource if it is drawn again,
 * so React's development double-mount is harmless.)
 */
export function useDisposable<T extends { dispose(): void }>(factory: () => T): T {
  const [value] = useState(factory);
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

export interface InstanceTransform {
  position: readonly [number, number, number];
  rotation?: readonly [number, number, number];
  scale?: readonly [number, number, number];
}

/**
 * Draws one geometry many times in a single draw call
 * (pilasters, vault ribs, skylights, fronds).
 */
export function InstancedParts({
  geometry,
  material,
  transforms,
  castShadow = false,
  receiveShadow = false,
}: {
  geometry: BufferGeometry;
  material: Material;
  transforms: readonly InstanceTransform[];
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new Matrix4();
    const q = new Quaternion();
    const e = new Euler();
    const p = new Vector3();
    const s = new Vector3();
    transforms.forEach((t, i) => {
      p.set(...t.position);
      // Yaw first, then pitch about the rotated axis, so tilted instances fan out around Y.
      const [rx, ry, rz] = t.rotation ?? [0, 0, 0];
      e.set(rx, ry, rz, "YXZ");
      q.setFromEuler(e);
      s.set(...(t.scale ?? [1, 1, 1]));
      mesh.setMatrixAt(i, m.compose(p, q, s));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [transforms]);
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, transforms.length]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    />
  );
}

/**
 * A spotlight aimed at a point. The target object is added to the scene graph
 * so its world matrix is kept current (a detached target silently aims at the origin).
 */
export function AimedSpotLight({
  aim,
  ...props
}: { aim: readonly [number, number, number] } & Omit<ComponentProps<"spotLight">, "target">) {
  const [target] = useState(() => new Object3D());
  return (
    <>
      <primitive object={target} position={aim} />
      <spotLight target={target} {...props} />
    </>
  );
}
