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
  /** Closing card shown at the end of the walk. */
  finale: HTMLElement;
  reducedMotion: boolean;
  onTime: (time: number) => void;
}

let registered = false;

/**
 * When a scroll update counts as a jump (the camera cuts) rather than a scroll (the camera catches up): it
 * moves more than JUMP.viewports viewport heights and either arrives after JUMP.idleMs without any update (an
 * in-page link) or moves more than JUMP.anyViewports in one go. Wheel and touch scrolling move a fraction of a
 * viewport per update; the chapter buttons' smooth scrolling can move 3.5 viewports per update when frames are
 * slow (measured at 25 fps on an Intel UHD 620), but in a stream of updates a frame apart.
 */
const JUMP = { viewports: 3, idleMs: 100, anyViewports: 12 } as const;

export interface MuseumTimeline {
  timeline: gsap.core.Timeline;
  dispose(): void;
}

/**
 * Builds the single scrubbed timeline that drives the experience. GSAP only
 * writes plain numbers into the motion store and DOM overlay styles; the 3D
 * scene reads the store each frame, so no two systems animate the same property.
 * The camera follows the timeline's own (smoothed) time: CameraRig turns it into
 * a pose along the route. Scrolling backwards simply plays the timeline in reverse.
 */
export function createMuseumTimeline(t: TimelineTargets): MuseumTimeline {
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    registered = true;
  }
  const v = t.store.values;
  let lastProgress: number | null = null;
  let lastUpdate = 0;
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: t.track,
      start: "top top",
      end: "bottom bottom",
      // A short catch-up turns wheel steps into continuous motion without the camera trailing the scrollbar;
      // with reduced motion it follows the scrollbar exactly.
      scrub: t.reducedMotion ? true : 0.6,
      onUpdate: (self) => {
        // A jump rather than a scroll (see JUMP; e.g. the in-page link "Return to the entrance") cuts
        // straight to the new point of the walk. Left to the catch-up, the camera would race through
        // everything in between, at hundreds of metres per second. ScrollTrigger has already aimed its
        // catch-up at the new position, so finishing it lands exactly there. (With reduced motion there is no
        // catch-up and getTween() returns 0: the camera already follows the scrollbar exactly.)
        const now = performance.now();
        const moved = lastProgress === null ? 0 : (Math.abs(self.progress - lastProgress) * (self.end - self.start)) / window.innerHeight;
        const jumped = moved > JUMP.viewports && (now - lastUpdate > JUMP.idleMs || moved > JUMP.anyViewports);
        lastProgress = self.progress;
        lastUpdate = now;
        const catchUp = self.getTween();
        if (catchUp && jumped) catchUp.progress(1);
        t.onTime(self.progress * TIMELINE_LENGTH);
      },
    },
    onUpdate: () => {
      v.time = tl.time();
      t.store.notify();
    },
  });

  // Keep the timeline exactly TIMELINE_LENGTH long so scroll progress maps 1:1 to the plan.
  tl.set({}, {}, TIMELINE_LENGTH);
  tl.fromTo(t.progress, { scaleY: 0 }, { scaleY: 1, duration: TIMELINE_LENGTH }, 0);

  // Doors open fully before the camera reaches the doorway.
  const doors = step("doors");
  tl.fromTo(v, { doorOpen: 0 }, { doorOpen: 1, duration: doors.duration - 0.5, ease: "power2.inOut" }, doors.start);
  tl.fromTo(t.hero, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -24, duration: 0.8, ease: "power1.in" }, doors.start);

  // Each painting's panel appears as the camera settles and leaves before it turns away.
  for (const s of TIMELINE_PLAN) {
    if (s.paintingIndex === undefined) continue;
    const panel = t.panels[s.paintingIndex];
    if (!panel) continue;
    tl.fromTo(panel, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power1.out" }, s.start - 0.35);
    tl.to(panel, { autoAlpha: 0, y: -12, duration: 0.35, ease: "power1.in" }, s.end);
  }

  // The closing card arrives as the camera settles before the final arch.
  const onward = step("onward");
  tl.fromTo(t.finale, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.55, ease: "power1.out" }, onward.start + onward.duration * 0.55);

  // When a resize changes the track's length (it is sized in viewport heights), keep the visitor at the
  // same point of the walk instead of letting the camera jump to wherever the old pixel offset now falls.
  // Progress is captured on the resize event itself (capture phase, before ScrollTrigger reacts): during a
  // refresh ScrollTrigger temporarily resets its triggers, so its own progress cannot be read then.
  let pendingProgress: number | null = null;
  let expiry = 0;
  const onResize = () => {
    const st = tl.scrollTrigger;
    if (!st || st.end <= st.start) return;
    if (pendingProgress === null) {
      pendingProgress = Math.min(1, Math.max(0, (window.scrollY - st.start) / (st.end - st.start)));
    }
    // Resizes that never lead to a refresh (e.g. a mobile address bar, ignored by design) must not
    // leave a stale position behind for a later refresh.
    window.clearTimeout(expiry);
    expiry = window.setTimeout(() => (pendingProgress = null), 1500);
  };
  const onRefresh = () => {
    const st = tl.scrollTrigger;
    if (!st || pendingProgress === null) return;
    const target = st.start + pendingProgress * (st.end - st.start);
    pendingProgress = null;
    window.clearTimeout(expiry);
    if (Math.abs(window.scrollY - target) > 1) window.scrollTo(0, target);
  };
  window.addEventListener("resize", onResize, { capture: true });
  ScrollTrigger.addEventListener("refresh", onRefresh);

  return {
    timeline: tl,
    dispose() {
      window.removeEventListener("resize", onResize, { capture: true });
      window.clearTimeout(expiry);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      tl.scrollTrigger?.kill();
      tl.kill();
    },
  };
}

/** Scroll offset (px) for a timeline position, used by the chapter buttons. */
export function scrollOffsetFor(tl: gsap.core.Timeline, time: number): number {
  const st = tl.scrollTrigger;
  if (!st) return 0;
  return st.start + (st.end - st.start) * (time / TIMELINE_LENGTH);
}
