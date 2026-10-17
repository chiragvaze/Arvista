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

/** True when a WebGL context can actually be created on this device. */
export function canUseWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
