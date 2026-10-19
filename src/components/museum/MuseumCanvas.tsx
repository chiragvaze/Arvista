"use client";

import { Suspense, memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  ACESFilmicToneMapping,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  FrontSide,
  Group,
  HalfFloatType,
  InstancedMesh,
  Mesh,
  MeshDepthMaterial,
  PMREMGenerator,
  WebGLRenderTarget,
  type Camera,
  type Material,
  type Scene,
  type Side,
  type Texture,
  type WebGLRenderer,
} from "three";
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
          gl.toneMappingExposure = 1.1;
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
        <PMREMWarmup />
        <Suspense fallback={null}>
          <MuseumScene store={store} quality={quality} />
          {/* The floor reflection and shadow map exist on the high tier only (see MarbleFloor and MuseumScene). */}
          <ShaderWarmup offscreenPasses={quality === "high"} onCompiled={onCompiled} />
          {compiled && <ReadySignal onReady={onReady} />}
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}

/** Memoised: overlay state changes in the page (chapter, loading) never re-render the 3D scene graph. */
export default memo(MuseumCanvas);

/**
 * Compiles every shader program the first frames will use before the first
 * frame is drawn. With KHR_parallel_shader_compile (most desktop browsers) this
 * happens off the main thread; drawing first would compile synchronously and
 * freeze the page, which is severe with ANGLE on Windows (around half a second
 * per program on a cold shader cache).
 *
 * Offscreen passes need programs of their own. The floor reflection renders the
 * scene into a render target, where three draws every material without tone
 * mapping and in linear colour, so each material it draws needs a second program. The
 * shadow map draws its casters with three's depth material. All sets are
 * compiled together, and the first frame waits for every program the renderer
 * holds.
 *
 * Stays mounted for the life of the scene: its stand-in depth materials must
 * outlive the shadow map's first render, which reuses their programs (disposing
 * them earlier would free programs that are still in use or still compiling).
 */
function ShaderWarmup({ offscreenPasses, onCompiled }: { offscreenPasses: boolean; onCompiled: () => void }) {
  const get = useThree((s) => s.get);
  useEffect(() => {
    let cancelled = false;
    let standIns: Group | null = null;
    const { gl, scene, camera } = get();
    const compileOffscreen = (casters: Group) => {
      const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
      const previous = gl.getRenderTarget();
      const fog = scene.fog;
      try {
        // compile() builds programs for the render target bound at the time.
        gl.setRenderTarget(target);
        compileReflected(gl, scene, camera);
        // The shadow map draws its casters outside the scene, so without fog (which is part of a program's
        // identity); its stand-ins take the scene's lights but not its fog.
        scene.fog = null;
        gl.compile(casters, camera, scene);
      } finally {
        scene.fog = fog;
        gl.setRenderTarget(previous);
        target.dispose();
      }
    };
    // Started on the next task rather than during React's commit: React's development checks unmount and remount
    // effects straight away, and the materials' owners dispose them on unmount, which would free their programs
    // mid-compile.
    const start = window.setTimeout(() => {
      const target = gl.getRenderTarget();
      try {
        gl.compile(scene, camera);
        if (offscreenPasses) {
          standIns = shadowDepthStandIns(scene);
          compileOffscreen(standIns);
        }
      } catch (error) {
        // A failed warmup only loses the head start: whatever was not compiled compiles on first draw instead.
        // compile() may have been interrupted inside one of three's own offscreen passes (it converts environment
        // maps as it goes), which would leave that pass's render target bound and every frame drawn into it.
        gl.setRenderTarget(target);
        console.warn("[ARVISTA] Shader warmup incomplete:", error);
      }
      // While the browser compiles, upload the scene's textures one per task (including paintings whose images
      // arrive meanwhile), so the first frame has none left to upload. Then wait for the last program.
      const uploaded = new Set<Texture>();
      const step = () => {
        if (cancelled) return;
        const texture = nextTextureToUpload(scene, uploaded);
        if (texture) {
          gl.initTexture(texture);
          uploaded.add(texture);
          window.setTimeout(step);
        } else if (programsCompiled(gl)) {
          onCompiled();
        } else {
          window.setTimeout(step, 10);
        }
      };
      step();
    });
    return () => {
      cancelled = true;
      window.clearTimeout(start);
      standIns?.children.forEach((child) => ((child as Mesh).material as Material).dispose());
    };
  }, [get, offscreenPasses, onCompiled]);
  return null;
}

/**
 * Compiles what the floor reflection draws: the objects on layer 0, the only
 * layer its camera renders (the floor and the details on DETAIL_LAYER are left
 * out). compile() takes every object whatever the camera's layers, but skips
 * objects without a material, so the others' materials are set aside meanwhile.
 */
function compileReflected(gl: WebGLRenderer, scene: Scene, camera: Camera) {
  const setAside = new Map<Mesh, Mesh["material"]>();
  scene.traverse((object) => {
    const mesh = object as Mesh;
    if (mesh.material && !mesh.layers.isEnabled(0)) setAside.set(mesh, mesh.material);
  });
  try {
    setAside.forEach((_, mesh) => (mesh.material = null as unknown as Material));
    gl.compile(scene, camera);
  } finally {
    setAside.forEach((material, mesh) => (mesh.material = material));
  }
}

/** three's WebGLProgram reports whether the browser has finished compiling it; missing from three's type declarations. */
type CompilingProgram = { isReady(): boolean };

/** Whether every program the renderer holds has finished compiling (compileAsync's test, across all materials). */
function programsCompiled(gl: WebGLRenderer): boolean {
  return ((gl.info.programs ?? []) as unknown as CompilingProgram[]).every((program) => program.isReady());
}

/** A texture used by a material in the scene that has not been uploaded yet (render targets need no upload). */
function nextTextureToUpload(scene: Scene, uploaded: Set<Texture>): Texture | null {
  let found: Texture | null = null;
  scene.traverse((object) => {
    const material = (object as Mesh).material;
    if (found || !material || Array.isArray(material)) return;
    for (const value of Object.values(material)) {
      const texture = value as Texture | null;
      if (texture?.isTexture && !texture.isRenderTargetTexture && !uploaded.has(texture)) {
        found = texture;
        return;
      }
    }
  });
  return found;
}

/** Cube size of every environment the scene renders (MuseumScene's Environment and ReflectionProbe's panels). */
const ENVIRONMENT_SIZE = 64;

/** PMREMGenerator internals used to build its GGX filter material ahead of its first use (three 0.186). */
interface PMREMInternals {
  _setSize(cubeSize: number): void;
  _allocateTargets(): WebGLRenderTarget;
  _ggxMaterial: Material | null;
}

/**
 * three converts each cube-map environment into its prefiltered (PMREM) form the
 * first time a material uses it, compiling its large GGX filter shader and
 * drawing with it at once: on a cold ANGLE shader cache that stalls the main
 * thread for two to three seconds. Compiling the same shader in the background
 * as soon as the canvas exists, while the scene's textures load, lets that first
 * use find it compiled. Mounted outside the scene's Suspense boundary so it
 * starts first; its material is kept until unmount so the program stays cached
 * for the renderer's own converter, which builds an identical material.
 *
 * The filter has no public compile method (and PMREMGenerator's own compile
 * helper uses an empty geometry, which yields a different program), so this
 * reaches into PMREMGenerator. If its internals change, only the head start is lost.
 */
function PMREMWarmup() {
  const get = useThree((s) => s.get);
  const warmup = useRef<(() => void) | null>(null);
  const pendingDispose = useRef(0);
  useLayoutEffect(() => {
    window.clearTimeout(pendingDispose.current);
    warmup.current ??= compilePMREMFilter(get());
    // Freed a moment after unmount rather than at once: React's development checks unmount and remount effects
    // straight away, and freeing the program then would delete it while it is still compiling.
    return () => {
      pendingDispose.current = window.setTimeout(() => {
        warmup.current?.();
        warmup.current = null;
      });
    };
  }, [get]);
  return null;
}

/** Starts compiling PMREMGenerator's GGX filter shader (see PMREMWarmup); returns the cleanup. */
function compilePMREMFilter({ gl, camera }: { gl: WebGLRenderer; camera: Camera }): () => void {
  const pmrem = new PMREMGenerator(gl);
  const internals = pmrem as unknown as Partial<PMREMInternals>;
  // Like the converter's own geometry: positions, no normals (both are part of a program's identity).
  const geometry = new BufferGeometry().setAttribute("position", new BufferAttribute(new Float32Array(9), 3));
  let target: WebGLRenderTarget | null = null;
  const previous = gl.getRenderTarget();
  try {
    if (internals._setSize && internals._allocateTargets) {
      internals._setSize(ENVIRONMENT_SIZE);
      target = internals._allocateTargets();
      // The converter draws into a render target, which is part of a program's identity too.
      gl.setRenderTarget(target);
      if (internals._ggxMaterial) gl.compile(new Mesh(geometry, internals._ggxMaterial), camera);
    }
  } catch {
    // Nothing is lost: the shader compiles on first use, as it would have anyway.
  } finally {
    gl.setRenderTarget(previous);
  }
  return () => {
    target?.dispose();
    geometry.dispose();
    pmrem.dispose();
  };
}

/** The face three's shadow map draws for each material side (WebGLShadowMap; VSM shadows are not used). */
const SHADOW_SIDE: Record<Side, Side> = { [FrontSide]: BackSide, [BackSide]: FrontSide, [DoubleSide]: DoubleSide };

/**
 * Meshes carrying the depth material three uses to draw each kind of shadow
 * caster in the scene (by face side, instanced or not), so the shadow map's
 * programs can be compiled ahead of its first render.
 */
function shadowDepthStandIns(scene: Scene): Group {
  const group = new Group();
  const seen = new Set<string>();
  scene.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh || !mesh.castShadow || Array.isArray(mesh.material)) return;
    const side = mesh.material.shadowSide ?? SHADOW_SIDE[mesh.material.side];
    const instanced = (mesh as InstancedMesh).isInstancedMesh === true;
    const key = `${side}:${instanced}`;
    if (seen.has(key)) return;
    seen.add(key);
    const depth = new MeshDepthMaterial({ side });
    group.add(instanced ? new InstancedMesh(mesh.geometry, depth, 1) : new Mesh(mesh.geometry, depth));
  });
  return group;
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
