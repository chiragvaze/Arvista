"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Painting } from "@/types/artwork";
import { createMotionStore } from "@/lib/museum/motion";
import { useCapabilities, usePrefersReducedMotion } from "@/lib/museum/clientEnvironment";
import {
  CHAPTERS,
  SCROLL_VH_PER_UNIT,
  TIMELINE_LENGTH,
  chapterAt,
  createMuseumTimeline,
  scrollOffsetFor,
  type Chapter,
  type ChapterId,
} from "@/lib/museum/scrollTimeline";
import { EntranceHero } from "./overlay/EntranceHero";
import { PaintingInformation } from "./overlay/PaintingInformation";
import { ChapterNav } from "./overlay/ChapterNav";
import { LoadingScreen } from "./overlay/LoadingScreen";
import styles from "./overlay/overlay.module.css";

// three.js and the scene graph load in a separate client-only chunk.
const MuseumCanvas = dynamic(() => import("./MuseumCanvas"), { ssr: false });

const SLOW_LOAD_MS = 12000;

/**
 * Orchestrates the walkthrough: a tall scroll track with a sticky stage holding
 * the 3D canvas and the HTML overlays. Falls back to a static entrance when
 * WebGL is unavailable or the scene fails.
 */
export function MuseumExperience({ painting }: { painting: Painting }) {
  const [store] = useState(createMotionStore);
  const capabilities = useCapabilities();
  const reducedMotion = usePrefersReducedMotion();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);
  const [chapter, setChapter] = useState<ChapterId>("entrance");

  const trackRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const mode = capabilities === null ? "checking" : capabilities.webgl && !failed ? "3d" : "static";

  useEffect(() => {
    if (mode !== "3d") return;
    const { track, hero, panel, progress } = {
      track: trackRef.current,
      hero: heroRef.current,
      panel: panelRef.current,
      progress: progressRef.current,
    };
    if (!track || !hero || !panel || !progress) return;
    const tl = createMuseumTimeline({
      store,
      track,
      hero,
      panel,
      progress,
      reducedMotion,
      onTime: (time) => setChapter(chapterAt(time)),
    });
    timelineRef.current = tl;
    store.notify();
    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
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
  const onContinue = useCallback(() => goTo(CHAPTERS[CHAPTERS.length - 1].time), [goTo]);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback((error: Error) => {
    console.error("[ARVISTA] 3D scene unavailable:", error.message);
    setFailed(true);
  }, []);

  if (mode === "static") {
    return (
      <section className={styles.staticEntrance} aria-labelledby="static-title">
        <h1 id="static-title" className={styles.heroTitle}>
          Arvista
          <span className={styles.heroSubtitle}>The Art Gallery</span>
        </h1>
        <span className={styles.heroRule} aria-hidden="true" />
        <p className={styles.heroTagline}>Every painting tells a story.</p>
        <p className={styles.staticNotice}>
          The 3D gallery could not start on this device, so the collection is shown in a simple view below.
        </p>
        <a className={styles.panelButton} href="#collection">
          View the collection
        </a>
      </section>
    );
  }

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
        <PaintingInformation ref={panelRef} painting={painting} onContinue={onContinue} />
        <ChapterNav chapters={CHAPTERS} active={chapter} onSelect={onSelectChapter} progressRef={progressRef} />
        <a className={styles.collectionLink} href="#collection">
          View collection
        </a>
        <LoadingScreen visible={!ready} slow={slow} />
      </div>
    </section>
  );
}
