/**
 * Shared animation values written by the scroll timeline and read by the 3D scene
 * inside useFrame. Values live in a plain mutable object so scrolling never
 * triggers React re-renders; only one writer (the GSAP timeline) touches them.
 */
export interface MuseumMotionValues {
  /** Position on the scroll timeline (after scrub smoothing), in timeline units; the camera rig turns it into a pose. */
  time: number;
  /** Door opening, 0 = closed, 1 = fully open. */
  doorOpen: number;
}

export interface MotionStore {
  readonly values: MuseumMotionValues;
  /** Called by the writer after changing values. */
  notify(): void;
  /** Subscribe to value changes (used to request an on-demand frame). */
  subscribe(listener: () => void): () => void;
}

export function createMotionStore(): MotionStore {
  const values: MuseumMotionValues = { time: 0, doorOpen: 0 };
  const listeners = new Set<() => void>();
  return {
    values,
    notify() {
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
