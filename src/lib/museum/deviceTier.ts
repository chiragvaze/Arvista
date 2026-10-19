export type QualityTier = "high" | "low";

/**
 * Coarse capability guess used to pick rendering features before the first frame.
 * Phones, tablets and low-core machines get the "low" tier: no floor reflections,
 * no dynamic shadows and a lower pixel ratio. The architecture is identical.
 */
export function detectQualityTier(): QualityTier {
  if (typeof window === "undefined") return "high";
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 700;
  const cores = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (coarsePointer || smallScreen || cores <= 4 || memory <= 4) return "low";
  return "high";
}

/**
 * True when a WebGL 2 context can actually be created on this device. three.js (r163 and later) renders with
 * WebGL 2 only, so a WebGL 1 context is no use: the museum would fail to start and fall back anyway, after
 * downloading the 3D code and logging errors. (A device can still fail later, e.g. on a driver problem; the
 * canvas's error boundary covers that.)
 */
export function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
