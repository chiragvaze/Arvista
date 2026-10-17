import styles from "./overlay.module.css";

/**
 * Shown until the first frame of the museum has rendered. The bar is an
 * indeterminate shimmer: the scene is mostly procedural, so there is no
 * meaningful percentage to report.
 */
export function LoadingScreen({ visible, slow }: { visible: boolean; slow: boolean }) {
  return (
    <div className={styles.loader} data-visible={visible} role="status" aria-live="polite" aria-hidden={!visible}>
      <p className={styles.loaderBrand}>Arvista</p>
      <span className={styles.loaderBar} aria-hidden="true" />
      <p className={styles.loaderText}>{visible ? "Preparing the gallery…" : "Gallery ready"}</p>
      {visible && slow && (
        <p className={styles.loaderSlow}>
          This is taking longer than usual. <a href="#collection">View the collection without 3D</a>
        </p>
      )}
    </div>
  );
}
