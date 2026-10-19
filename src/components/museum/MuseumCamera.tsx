"use client";

import { useEffect, useLayoutEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import { BASE_FOV, CameraRig, applyLens, cameraRoute, type LensShift } from "@/lib/museum/cameraWaypoints";
import { DETAIL_LAYER } from "./helpers";
import type { MotionStore } from "@/lib/museum/motion";

/** Viewports narrower than this use the portrait framing of each waypoint. */
const PORTRAIT_ASPECT = 0.85;
const MAX_FOV = 68;
/** Horizontal half-extent (tan) the landscape framing was composed for. */
const REFERENCE_TAN_H = Math.tan(((BASE_FOV / 2) * Math.PI) / 180) * 1.45;

/** Widens the vertical field of view on narrow screens so the composition keeps its width. */
export function fovForAspect(aspect: number): number {
  const needed = (2 * Math.atan(REFERENCE_TAN_H / aspect) * 180) / Math.PI;
  return Math.min(MAX_FOV, Math.max(BASE_FOV, needed));
}

/**
 * Places the camera on the waypoint path. The scroll timeline is the only writer
 * of `time`; this component is the only writer of the camera transform and of
 * its lens shift (the view offset of its projection, set at the entrance and
 * the paintings so the facade stands upright and the frames stay rectangular).
 */
export function MuseumCamera({ store }: { store: MotionStore }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const get = useThree((s) => s.get);
  const portrait = aspect < PORTRAIT_ASPECT;
  const rig = useMemo(() => new CameraRig(cameraRoute, portrait), [portrait]);
  const lens = useMemo<LensShift>(() => ({ x: 0, y: 0, scale: 1 }), []);

  useLayoutEffect(() => {
    const { camera, invalidate } = get();
    if (camera instanceof PerspectiveCamera) {
      camera.fov = fovForAspect(aspect);
      // The camera never comes closer than ~1 m to any surface; a larger near plane triples depth precision.
      camera.near = 0.15;
      camera.far = 140;
      camera.updateProjectionMatrix();
    }
    // The visitor sees the details the floor reflection leaves out.
    camera.layers.enable(DETAIL_LAYER);
    invalidate();
  }, [aspect, get]);

  useFrame(({ camera }) => {
    const perspective = camera instanceof PerspectiveCamera;
    rig.sample(store.values.time, camera.position, camera.quaternion, perspective ? lens : undefined);
    if (perspective) applyLens(camera, lens);
  });

  return null;
}

/** Requests a frame whenever the scroll timeline changes a value (the canvas renders on demand). */
export function MotionInvalidator({ store }: { store: MotionStore }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => store.subscribe(() => invalidate()), [store, invalidate]);
  return null;
}
