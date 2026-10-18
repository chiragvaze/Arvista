"use client";

import { Suspense, memo, useCallback, useEffect, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import type { QualityTier } from "@/lib/museum/deviceTier";
import type { MotionStore } from "@/lib/museum/motion";
import { cameraWaypoints } from "@/lib/museum/cameraWaypoints";
import { MuseumScene } from "./MuseumScene";
import { ErrorBoundary } from "./ErrorBoundary";

export interface MuseumCanvasProps {
  store: MotionStore;
  quality: QualityTier;
  onReady: () => void;
  onError: (error: Error) => void;
}

const CONTEXT_RESTORE_GRACE_MS = 2500;

const DPR_RANGE: Record<QualityTier, [number, number]> = {
  high: [1, 1.75],
  low: [1, 1.4],
};

/**
 * WebGL canvas for the museum. Renders on demand (only while the scroll state
 * changes, so an idle page costs nothing), caps the pixel ratio per quality tier,
 * and reports a lost context or render failure so the page can fall back to the
 * static gallery. Nothing is drawn until every shader has been compiled in the
 * background, so the page stays responsive while the loading screen is shown.
 */
function MuseumCanvas({ store, quality, onReady, onError }: MuseumCanvasProps) {
  const start = cameraWaypoints[0].position;
  const [compiled, setCompiled] = useState(false);
  const onCompiled = useCallback(() => setCompiled(true), []);

  return (
    <ErrorBoundary fallback={null} onError={onError}>
      <Canvas
        frameloop={compiled ? "demand" : "never"}
        dpr={DPR_RANGE[quality]}
        shadows={quality === "high" ? "percentage" : false}
        gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 42, near: 0.15, far: 140, position: [start[0], start[1], start[2]] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          // Every shadow caster is static except the doors, which request an update when they move
          // (see DoubleDoors). This avoids re-rendering four shadow maps on every frame of the walk.
          gl.shadowMap.autoUpdate = false;
          gl.shadowMap.needsUpdate = true;
          const canvas = gl.domElement;
          canvas.addEventListener("webglcontextlost", (event) => {
            event.preventDefault();
            // The canvas releases its context on unmount too; only a loss on a live,
            // still-attached canvas that the browser does not restore is a failure.
            window.setTimeout(() => {
              if (canvas.isConnected && gl.getContext().isContextLost()) onError(new Error("WebGL context lost"));
            }, CONTEXT_RESTORE_GRACE_MS);
          });
        }}
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <MuseumScene store={store} quality={quality} />
          {compiled ? <ReadySignal onReady={onReady} /> : <ShaderWarmup onCompiled={onCompiled} />}
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}

/** Memoised: overlay state changes in the page (chapter, loading) never re-render the 3D scene graph. */
export default memo(MuseumCanvas);

/**
 * Compiles every material in the scene before the first frame. With
 * KHR_parallel_shader_compile (most desktop browsers) this happens off the main
 * thread; drawing first would compile synchronously and freeze the page, which
 * is severe with ANGLE on Windows.
 */
function ShaderWarmup({ onCompiled }: { onCompiled: () => void }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    let cancelled = false;
    const { gl, scene, camera } = get();
    gl.compileAsync(scene, camera)
      .catch(() => undefined)
      .then(() => {
        if (!cancelled) onCompiled();
      });
    return () => {
      cancelled = true;
    };
  }, [get, onCompiled]);
  return null;
}

/** Fires once the scene has mounted and two frames have been drawn. */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let second = 0;
    invalidate();
    const first = requestAnimationFrame(() => {
      invalidate();
      second = requestAnimationFrame(() => onReady());
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [invalidate, onReady]);
  return null;
}
