import type { Ref } from "react";
import styles from "./overlay.module.css";
import { ScrollIndicator } from "./ScrollIndicator";

/** Museum branding shown over the closed doors. Faded out by the scroll timeline as the doors open. */
export function EntranceHero({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={styles.hero}>
      <div className={styles.heroBrand}>
        <h1 className={styles.heroTitle}>
          Arvista
          <span className={styles.heroSubtitle}>The Art Gallery</span>
        </h1>
        <span className={styles.heroRule} aria-hidden="true" />
        <p className={styles.heroTagline}>Every painting tells a story.</p>
      </div>
      <ScrollIndicator />
    </div>
  );
}
