export type QualityTier = "high" | "low";

/** What the quality tier is chosen from: the device, never the size of the browser window. */
export interface DeviceSignals {
  /** The primary pointer is a finger (phones and tablets). */
  coarsePointer: boolean;
  /** Shorter side of the display (not the window), in CSS pixels. */
  screenShortSide: number;
  /** Logical processors. */
  cores: number;
  /** Approximate device memory in GB (Chromium reports it, capped at 8). */
  memoryGB: number;
}

/** Displays whose shorter side is below this are phone-sized. */
const PHONE_SCREEN = 700;

/**
 * Coarse capability guess used to pick rendering features before the first frame.
 * Phones, tablets and low-core or low-memory machines get the "low" tier: no floor
 * reflections, no dynamic shadows, a lower pixel-ratio cap and smaller painting
 * images. The architecture is identical.
 *
 * A phone is recognised by its display, not by the window: a desktop browser window
 * can be short (a maximised window on a 1366x768 laptop is about 657 px tall), and a
 * smaller window draws fewer pixels, so it never needs a lower tier on that account.
 */
export function selectQualityTier({ coarsePointer, screenShortSide, cores, memoryGB }: DeviceSignals): QualityTier {
  if (coarsePointer || screenShortSide < PHONE_SCREEN || cores <= 4 || memoryGB <= 4) return "low";
  return "high";
}

/** Reads DeviceSignals from the browser. Signals a browser does not report count as capable. */
export function readDeviceSignals(): DeviceSignals {
  // Some embedded browsers report a 0x0 screen; the window is then the best guess at the display.
  const screenShortSide = Math.min(window.screen.width, window.screen.height) || Math.min(window.innerWidth, window.innerHeight);
  return {
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
    screenShortSide,
    cores: navigator.hardwareConcurrency ?? 8,
    memoryGB: (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8,
  };
}

export function detectQualityTier(): QualityTier {
  if (typeof window === "undefined") return "high";
  return selectQualityTier(readDeviceSignals());
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
