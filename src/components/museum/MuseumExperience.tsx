"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createMotionStore } from "@/lib/museum/motion";
import { galleryLayout } from "@/lib/museum/galleryLayout";
import { useCapabilities, usePrefersReducedMotion } from "@/lib/museum/clientEnvironment";
import {
  CHAPTERS,
  SCROLL_VH_PER_UNIT,
  TIMELINE_LENGTH,
  chapterAt,
  createMuseumTimeline,
  nextChapterAfter,
  scrollOffsetFor,
  type Chapter,
} from "@/lib/museum/scrollTimeline";
import { ARTIST, GALLERY } from "@/content/site";
import { EntranceHero } from "./overlay/EntranceHero";
import { PaintingInformation } from "./overlay/PaintingInformation";
import { ArtistFinale } from "./overlay/ArtistFinale";
import { ChapterNav } from "./overlay/ChapterNav";
import { LoadingScreen } from "./overlay/LoadingScreen";
import styles from "./overlay/overlay.module.css";

// three.js and the scene graph load in a separate client-only chunk.
const MuseumCanvas = dynamic(() => import("./MuseumCanvas"), { ssr: false });

/**
 * When the loading screen offers the collection without 3D. A first visit compiles every shader from cold,
 * which takes 12–20 s on an Intel UHD 620 (about 12 s on an idle machine, up to 20 s with background load),
 * so the notice waits beyond that: it is for a load that has genuinely stalled, not a normal first visit.
 */
const SLOW_LOAD_MS = 25000;

/**
 * Orchestrates the walkthrough: a tall scroll track with a sticky stage holding
 * the 3D canvas and the HTML overlays. Falls back to a static entrance when
 * WebGL is unavailable or the scene fails.
 */
export function MuseumExperience() {
  const [store] = useState(createMotionStore);
  const capabilities = useCapabilities();
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [chapter, setChapter] = useState(CHAPTERS[0].id);

  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const progressRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const mode = capabilities === null ? "checking" : capabilities.webgl && !failed ? "3d" : "static";

  useEffect(() => {
    if (mode !== "3d") return;
    const track = trackRef.current;
    const hero = heroRef.current;
    const finale = finaleRef.current;
    const progress = progressRef.current;
    const panels = galleryLayout.map((_, i) => panelRefs.current[i]);
    if (!track || !hero || !finale || !progress || panels.some((p) => !p)) return;
    const museum = createMuseumTimeline({
      store,
      track,
      hero,
      finale,
      panels: panels as HTMLElement[],
      progress,
      reducedMotion,
      onTime: (time) => setChapter(chapterAt(time)),
    });
    timelineRef.current = museum.timeline;
    store.notify();
    return () => {
      museum.dispose();
      timelineRef.current = null;
    };
  }, [mode, reducedMotion, store]);

  useEffect(() => {
    if (mode !== "3d" || ready) return;
    const timer = window.setTimeout(() => setSlow(true), SLOW_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [mode, ready]);

  const goTo = useCallback(
    (time: number) => {
      const tl = timelineRef.current;
      if (!tl) return;
      window.scrollTo({ top: scrollOffsetFor(tl, time), behavior: reducedMotion ? "auto" : "smooth" });
    },
    [reducedMotion],
  );
  const onSelectChapter = useCallback((c: Chapter) => goTo(c.time), [goTo]);

  // The Previous and Next buttons belong to the panel they leave, which the timeline hides on the way (and the
  // browser then drops focus to the page). Keyboard users are taken to the heading of where they arrive.
  const cancelFocus = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelFocus.current?.(), []);
  const goToChapter = useCallback(
    (c: Chapter, keyboard: boolean) => {
      cancelFocus.current?.();
      cancelFocus.current = null;
      goTo(c.time);
      if (!keyboard) return;
      // Chapters are [entrance, painting 1 … painting n, next hall].
      const index = CHAPTERS.indexOf(c);
      const container =
        index === 0 ? heroRef.current : index === CHAPTERS.length - 1 ? finaleRef.current : panelRefs.current[index - 1];
      const heading = container?.querySelector<HTMLElement>("h1, h2");
      if (container && heading) cancelFocus.current = focusWhenShown(heading, container);
    },
    [goTo],
  );
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback((error: Error) => {
    console.error("[ARVISTA] 3D scene unavailable:", error.message);
    setFailed(true);
  }, []);

  if (mode === "static") {
    return (
      <section className={styles.staticEntrance} aria-labelledby="static-title">
        <h1 id="static-title" className={styles.heroTitle}>
          {GALLERY.name}
          <span className={styles.heroSubtitle}>{GALLERY.subtitle}</span>
        </h1>
        <span className={styles.heroRule} aria-hidden="true" />
        <p className={styles.heroAttribution}>{ARTIST.attribution}</p>
        <p className={styles.heroTagline}>{GALLERY.tagline}</p>
        <p className={styles.staticNotice}>
          The 3D gallery could not start on this device, so the collection is shown in a simple view below.
        </p>
        <a className={styles.panelNext} href="#collection">
          View the collection <span aria-hidden="true">→</span>
        </a>
      </section>
    );
  }

  const total = galleryLayout.length;
  return (
    <section
      ref={trackRef}
      className={styles.track}
      style={{ height: `${TIMELINE_LENGTH * SCROLL_VH_PER_UNIT}vh` }}
      aria-label="3D museum walkthrough. Scroll to walk through the gallery, or use the walkthrough navigation."
    >
      <div className={styles.stage}>
        {mode === "3d" && capabilities && (
          <div className={styles.canvas}>
            <MuseumCanvas store={store} quality={capabilities.quality} onReady={onReady} onError={onError} />
          </div>
        )}
        <div className={styles.vignette} aria-hidden="true" />
        <EntranceHero ref={heroRef} />
        {galleryLayout.map(({ painting }, i) => {
          const next = nextChapterAfter(i);
          // Chapters are [entrance, painting 1 … painting n, next hall]; painting i is chapter i + 1.
          const previous = CHAPTERS[i];
          return (
            <PaintingInformation
              key={painting.id}
              ref={(el) => {
                panelRefs.current[i] = el;
              }}
              painting={painting}
              number={i + 1}
              total={total}
              previousLabel={i === 0 ? "Entrance" : "Previous"}
              continueLabel={next.id === "next-hall" ? "Continue" : "Next painting"}
              onPrevious={(keyboard) => goToChapter(previous, keyboard)}
              onContinue={(keyboard) => goToChapter(next, keyboard)}
            />
          );
        })}
        <ArtistFinale ref={finaleRef} />
        <ChapterNav chapters={CHAPTERS} active={chapter} onSelect={onSelectChapter} progressRef={progressRef} />
        <a className={styles.collectionLink} href="#collection">
          View collection
        </a>
        <LoadingScreen visible={!ready} slow={slow} />
      </div>
    </section>
  );
}

/** Inputs that mean the visitor has taken over, so a pending focus move no longer applies. */
const TAKE_OVER_EVENTS = ["wheel", "touchstart", "pointerdown", "keydown"] as const;

/**
 * Focuses `target` as soon as `container` is shown (the scroll timeline reveals it by writing its inline
 * style), without scrolling, since the scroll position drives the camera. Gives up if the visitor scrolls,
 * touches, clicks or presses a key first. Returns a function that cancels it.
 */
function focusWhenShown(target: HTMLElement, container: HTMLElement): () => void {
  const observer = new MutationObserver(() => tryFocus());
  const cancel = () => {
    observer.disconnect();
    for (const type of TAKE_OVER_EVENTS) window.removeEventListener(type, cancel, true);
  };
  const tryFocus = () => {
    if (getComputedStyle(container).visibility !== "visible") return;
    target.focus({ preventScroll: true });
    cancel();
  };
  observer.observe(container, { attributes: true, attributeFilter: ["style"] });
  for (const type of TAKE_OVER_EVENTS) window.addEventListener(type, cancel, { capture: true, passive: true });
  tryFocus();
  return cancel;
}
