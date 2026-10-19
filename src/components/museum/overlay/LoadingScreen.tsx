import { ARTIST } from "@/content/site";
import styles from "./overlay.module.css";

/**
 * Shown until the first frame of the museum has rendered. The bar is an
 * indeterminate shimmer: the scene is mostly procedural, so there is no
 * meaningful percentage to report. A polite status region: "Gallery ready" is
 * announced as it fades (it leaves the accessibility tree once hidden, when the
 * fade ends), and so is the slow-load notice if it appears.
 */
export function LoadingScreen({ visible, slow }: { visible: boolean; slow: boolean }) {
  return (
    <div className={styles.loader} data-visible={visible} role="status" aria-live="polite">
      <p className={styles.loaderBrand}>Arvista</p>
      <span className={styles.loaderBar} aria-hidden="true" />
      <p className={styles.loaderText}>{visible ? "Preparing the gallery…" : "Gallery ready"}</p>
      <p className={styles.heroAttribution}>{ARTIST.attribution}</p>
      {visible && slow && (
        <p className={styles.loaderSlow}>
          This is taking longer than usual. <a href="#collection">View the collection without 3D</a>
        </p>
      )}
    </div>
  );
}
