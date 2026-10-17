"use client";

import { Suspense, useEffect } from "react";
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
 * static gallery.
 */
export default function MuseumCanvas({ store, quality, onReady, onError }: MuseumCanvasProps) {
  const start = cameraWaypoints[0].position;

  return (
    <ErrorBoundary fallback={null} onError={onError}>
      <Canvas
        frameloop="demand"
        dpr={DPR_RANGE[quality]}
        shadows={quality === "high" ? "percentage" : false}
        gl={{ antialias: true, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 42, near: 0.05, far: 140, position: [start[0], start[1], start[2]] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
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
          <ReadySignal onReady={onReady} />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
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
