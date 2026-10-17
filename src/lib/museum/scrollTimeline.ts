import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { waypointIndex } from "./cameraWaypoints";
import type { MotionStore } from "./motion";

/**
 * The scroll sequence, in abstract timeline units. One unit is
 * SCROLL_VH_PER_UNIT viewport heights of scrolling.
 *
 *   entrance  closed doors, branding visible
 *   doors     doors swing open while the camera approaches the portico
 *   threshold camera passes through the doorway
 *   corridor  camera walks along the gallery
 *   turn      camera turns toward the first painting and slows to a stop
 *   painting  hold: information panel visible
 *   onward    camera turns back down the corridor toward the next hall
 */
export const PHASES = {
  entrance: { start: 0, end: 0.7 },
  doors: { start: 0.7, end: 3.1 },
  threshold: { start: 3.1, end: 4.5 },
  corridor: { start: 4.5, end: 5.4 },
  turn: { start: 5.4, end: 7.3 },
  painting: { start: 7.3, end: 9.4 },
  onward: { start: 9.4, end: 11.1 },
} as const;

export const TIMELINE_LENGTH = 11.5;
export const SCROLL_VH_PER_UNIT = 85;

export type ChapterId = "entrance" | "gallery" | "painting" | "onward";

export interface Chapter {
  id: ChapterId;
  label: string;
  /** Timeline position the chapter button scrolls to. */
  time: number;
}

export const CHAPTERS: Chapter[] = [
  { id: "entrance", label: "Entrance", time: 0 },
  { id: "gallery", label: "Gallery", time: PHASES.corridor.start },
  { id: "painting", label: "First painting", time: (PHASES.painting.start + PHASES.painting.end) / 2 },
  { id: "onward", label: "Next hall", time: PHASES.onward.end },
];

export function chapterAt(time: number): ChapterId {
  if (time >= PHASES.onward.start + 0.4) return "onward";
  if (time >= PHASES.turn.end - 0.3) return "painting";
  if (time >= PHASES.threshold.start + 0.6) return "gallery";
  return "entrance";
}

export interface TimelineTargets {
  store: MotionStore;
  track: HTMLElement;
  hero: HTMLElement;
  panel: HTMLElement;
  progress: HTMLElement;
  reducedMotion: boolean;
  onTime: (time: number) => void;
}

let registered = false;

/**
 * Builds the single scrubbed timeline that drives the experience. GSAP only
 * writes plain numbers into the motion store and DOM overlay styles; the 3D
 * scene reads the store each frame, so no two systems animate the same property.
 * Scrolling backwards simply plays the timeline in reverse.
 */
export function createMuseumTimeline(t: TimelineTargets): gsap.core.Timeline {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  const v = t.store.values;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: t.track,
      start: "top top",
      end: "bottom bottom",
      // A short catch-up smooths wheel steps into continuous motion; reduced motion follows the scrollbar exactly.
      scrub: t.reducedMotion ? true : 0.9,
      onUpdate: (self) => t.onTime(self.progress * TIMELINE_LENGTH),
    },
    onUpdate: () => t.store.notify(),
  });

  const seg = (phase: keyof typeof PHASES) => ({
    at: PHASES[phase].start,
    duration: PHASES[phase].end - PHASES[phase].start,
  });

  // Keep the timeline exactly TIMELINE_LENGTH long so scroll progress maps 1:1 to phases.
  tl.set({}, {}, TIMELINE_LENGTH);
  tl.fromTo(t.progress, { scaleY: 0 }, { scaleY: 1, duration: TIMELINE_LENGTH }, 0);

  // Doors open fully before the camera reaches the doorway.
  const doors = seg("doors");
  tl.fromTo(v, { doorOpen: 0 }, { doorOpen: 1, duration: doors.duration - 0.5, ease: "power2.inOut" }, doors.at);
  tl.fromTo(t.hero, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.8, ease: "power1.in" }, doors.at);

  // Camera: one tween per waypoint segment, accelerating from rest and settling at the painting.
  // Explicit from-values keep every segment deterministic however the page is entered or scrubbed.
  // Only the first segment renders immediately; later ones must not overwrite the start pose at build time.
  let firstSegment = true;
  const camera = (from: string, to: string, phase: keyof typeof PHASES, ease = "none") => {
    const { at, duration } = seg(phase);
    tl.fromTo(
      v,
      { cameraT: waypointIndex(from) },
      { cameraT: waypointIndex(to), duration, ease, immediateRender: firstSegment },
      at,
    );
    firstSegment = false;
  };
  camera("entrance", "approach", "doors", "power1.in");
  camera("approach", "threshold", "threshold");
  camera("threshold", "corridor", "corridor");
  camera("corridor", "painting", "turn", "power1.out");
  camera("painting", "onward", "onward", "power1.inOut");

  // Information panel appears as the camera settles and leaves before it turns away.
  tl.fromTo(t.panel, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power1.out" }, PHASES.turn.end - 0.35);
  tl.to(t.panel, { autoAlpha: 0, y: -12, duration: 0.35, ease: "power1.in" }, PHASES.onward.start);

  return tl;
}

/** Scroll offset (px) for a timeline position, used by the chapter buttons. */
export function scrollOffsetFor(tl: gsap.core.Timeline, time: number): number {
  const st = tl.scrollTrigger;
  if (!st) return 0;
  return st.start + (st.end - st.start) * (time / TIMELINE_LENGTH);
}
