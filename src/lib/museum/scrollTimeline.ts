import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cameraRoute, type RouteStep } from "./cameraWaypoints";
import { galleryLayout } from "./galleryLayout";
import type { MotionStore } from "./motion";

/**
 * The scroll sequence is the camera route laid end to end, in abstract timeline
 * units (one unit = SCROLL_VH_PER_UNIT viewport heights of scrolling):
 *
 *   entrance   closed doors, branding visible
 *   doors      doors swing open while the camera approaches the porch
 *   threshold  camera passes through the doorway
 *   per painting:
 *     walk     walk down the corridor toward it
 *     turn     turn to face it and slow to a stop
 *     view     pause with its information panel visible
 *     resume   turn back to face down the corridor
 *   onward     walk toward the next hall
 */
export interface PlannedStep extends RouteStep {
  start: number;
  end: number;
}

function planSteps(steps: readonly RouteStep[]): PlannedStep[] {
  let time = 0;
  return steps.map((step) => {
    const planned = { ...step, start: time, end: time + step.duration };
    time = planned.end;
    return planned;
  });
}

export const TIMELINE_PLAN: PlannedStep[] = planSteps(cameraRoute.steps);
export const TIMELINE_LENGTH = TIMELINE_PLAN[TIMELINE_PLAN.length - 1].end;
export const SCROLL_VH_PER_UNIT = 72;

function step(id: string): PlannedStep {
  const found = TIMELINE_PLAN.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown timeline step: ${id}`);
  return found;
}

export interface Chapter {
  id: string;
  label: string;
  /** Timeline position the chapter button scrolls to. */
  time: number;
  /** Timeline position from which the chapter counts as current. */
  from: number;
}

const onwardStep = step("onward");

export const CHAPTERS: Chapter[] = [
  { id: "entrance", label: "Entrance", time: 0, from: 0 },
  ...galleryLayout.map(({ painting }) => {
    const turn = step(`turn:${painting.id}`);
    const view = step(`view:${painting.id}`);
    return { id: painting.id, label: painting.title, time: (view.start + view.end) / 2, from: turn.start + turn.duration * 0.5 };
  }),
  { id: "next-hall", label: "Next hall", time: onwardStep.end, from: onwardStep.start + 0.4 },
];

export function chapterAt(time: number): string {
  let current = CHAPTERS[0].id;
  for (const chapter of CHAPTERS) if (time >= chapter.from) current = chapter.id;
  return current;
}

/** Where the "Continue" button on a painting's panel leads: the next painting, or the next hall after the last. */
export function nextChapterAfter(paintingIndex: number): Chapter {
  return CHAPTERS[Math.min(paintingIndex + 2, CHAPTERS.length - 1)];
}

export interface TimelineTargets {
  store: MotionStore;
  track: HTMLElement;
  hero: HTMLElement;
  /** Information panels, indexed like galleryLayout. */
  panels: readonly HTMLElement[];
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

  // Keep the timeline exactly TIMELINE_LENGTH long so scroll progress maps 1:1 to the plan.
  tl.set({}, {}, TIMELINE_LENGTH);
  tl.fromTo(t.progress, { scaleY: 0 }, { scaleY: 1, duration: TIMELINE_LENGTH }, 0);

  // Doors open fully before the camera reaches the doorway.
  const doors = step("doors");
  tl.fromTo(v, { doorOpen: 0 }, { doorOpen: 1, duration: doors.duration - 0.5, ease: "power2.inOut" }, doors.start);
  tl.fromTo(t.hero, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.8, ease: "power1.in" }, doors.start);

  // Camera: one tween per moving step, each from the previous waypoint to the next. Explicit
  // from-values keep segments deterministic however the page is entered or scrubbed; only the
  // first renders immediately so later segments cannot overwrite the start pose at build time.
  let waypoint = 0;
  for (const s of TIMELINE_PLAN) {
    if (s.to === undefined) continue;
    tl.fromTo(
      v,
      { cameraT: waypoint },
      { cameraT: s.to, duration: s.duration, ease: s.ease ?? "none", immediateRender: waypoint === 0 },
      s.start,
    );
    waypoint = s.to;
  }

  // Each painting's panel appears as the camera settles and leaves before it turns away.
  for (const s of TIMELINE_PLAN) {
    if (s.paintingIndex === undefined) continue;
    const panel = t.panels[s.paintingIndex];
    if (!panel) continue;
    tl.fromTo(panel, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power1.out" }, s.start - 0.35);
    tl.to(panel, { autoAlpha: 0, y: -12, duration: 0.35, ease: "power1.in" }, s.end);
  }

  return tl;
}

/** Scroll offset (px) for a timeline position, used by the chapter buttons. */
export function scrollOffsetFor(tl: gsap.core.Timeline, time: number): number {
  const st = tl.scrollTrigger;
  if (!st) return 0;
  return st.start + (st.end - st.start) * (time / TIMELINE_LENGTH);
}
