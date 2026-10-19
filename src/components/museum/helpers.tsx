"use client";

import { createContext, useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { Euler, InstancedMesh, Matrix4, Object3D, Quaternion, Vector3, type BufferGeometry, type Group, type Light, type Material } from "three";
import { bevelledBox } from "@/lib/museum/geometry";

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
 * How many times the WebGL context has been restored after a loss (counted by MuseumScene). three re-uploads
 * textures and geometry by itself after a restore, but not what was drawn into render targets: resources that
 * are drawn once rather than every frame (the light-panel cube maps, the environment, the shadow map) come back
 * blank, so their owners depend on this count to draw them again.
 */
export const ContextRestorations = createContext(0);

/**
 * Render layer for what the marble floor's reflection leaves out: the floor
 * itself, and small or floor-level details that make no visible difference in
 * the blurred reflection (leaving them out saves draw calls in a pass that runs
 * every frame). The visitor's camera renders this layer as well; only the
 * reflection camera (layer 0) skips it.
 */
export const DETAIL_LAYER = 1;

/**
 * Puts everything inside on the detail layer. Lights are left alone: three
 * only uses the lights a camera can see, so a light on another layer would
 * light the reflection differently and force every shader to compile twice.
 */
export function NotReflected({ children }: { children: ReactNode }) {
  const ref = useRef<Group>(null);
  // No dependency list: children that mount later (e.g. after Suspense) are moved too.
  useLayoutEffect(() => {
    ref.current?.traverse((object) => {
      if (!(object as Light).isLight) object.layers.set(DETAIL_LAYER);
    });
  });
  return <group ref={ref}>{children}</group>;
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
  reflected = true,
}: {
  geometry: BufferGeometry;
  material: Material;
  transforms: readonly InstanceTransform[];
  castShadow?: boolean;
  receiveShadow?: boolean;
  /** False to leave these instances out of the floor's reflection (see DETAIL_LAYER). */
  reflected?: boolean;
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
    mesh.layers.set(reflected ? 0 : DETAIL_LAYER);
  }, [transforms, reflected]);
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

/**
 * Drop-in replacement for `<boxGeometry args={[w, h, d]} />` inside a mesh,
 * with softly rounded edges (see bevelledBox).
 */
export function BevelledBox({
  args,
  radius,
  faceUVs,
}: {
  args: readonly [number, number, number];
  radius?: number;
  /** Keep 0..1 UVs on each face (for face-sized patterns such as fluting) instead of metric ones. */
  faceUVs?: boolean;
}) {
  const geometry = useDisposable(() => bevelledBox(args[0], args[1], args[2], radius, { faceUVs }));
  return <primitive object={geometry} attach="geometry" />;
}
