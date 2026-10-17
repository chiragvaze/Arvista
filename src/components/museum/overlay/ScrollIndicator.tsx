import styles from "./overlay.module.css";

/** "Scroll to enter" cue. The animated dot is disabled under prefers-reduced-motion. */
export function ScrollIndicator() {
  return (
    <div className={styles.scrollCue}>
      <span className={styles.scrollCueText}>Scroll to enter</span>
      <span className={styles.scrollCueMouse} aria-hidden="true">
        <span className={styles.scrollCueDot} />
      </span>
    </div>
  );
}
