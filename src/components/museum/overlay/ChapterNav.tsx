import type { Ref } from "react";
import type { Chapter } from "@/lib/museum/scrollTimeline";
import styles from "./overlay.module.css";

/**
 * Keyboard-accessible alternative to scrolling: jump to any point of the walk.
 * The vertical line shows overall progress through the sequence. Each button is
 * named by aria-label, because its visible label is only shown on hover or focus
 * (and not at all on narrow screens).
 */
export function ChapterNav({
  chapters,
  active,
  onSelect,
  progressRef,
}: {
  chapters: Chapter[];
  active: string;
  onSelect: (chapter: Chapter) => void;
  progressRef?: Ref<HTMLSpanElement>;
}) {
  return (
    <nav className={styles.chapters} aria-label="Gallery walkthrough">
      <span className={styles.chapterTrack} aria-hidden="true">
        <span ref={progressRef} className={styles.chapterProgress} />
      </span>
      <ol className={styles.chapterList}>
        {chapters.map((chapter) => (
          <li key={chapter.id}>
            <button
              type="button"
              className={styles.chapterButton}
              aria-label={chapter.label}
              aria-current={chapter.id === active ? "step" : undefined}
              onClick={() => onSelect(chapter)}
            >
              <span className={styles.chapterLabel} aria-hidden="true">
                {chapter.label}
              </span>
              <span className={styles.chapterDot} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
