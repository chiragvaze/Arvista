"use client";

import { useSyncExternalStore } from "react";
import { canUseWebGL, detectQualityTier, type QualityTier } from "./deviceTier";

export interface Capabilities {
  webgl: boolean;
  quality: QualityTier;
}

let cachedCapabilities: Capabilities | null = null;
const noopSubscribe = () => () => {};

function readCapabilities(): Capabilities {
  cachedCapabilities ??= { webgl: canUseWebGL(), quality: detectQualityTier() };
  return cachedCapabilities;
}

/** Device capabilities, measured once on the client. `null` during server rendering and hydration. */
export function useCapabilities(): Capabilities | null {
  return useSyncExternalStore(noopSubscribe, readCapabilities, () => null);
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Live `prefers-reduced-motion` preference. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}
