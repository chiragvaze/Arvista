import type { Ref } from "react";
import { ARTIST, GALLERY } from "@/content/site";
import styles from "./overlay.module.css";

/** Closing card at the end of the walk, before the arch to the next hall. Faded in by the scroll timeline. */
export function ArtistFinale({ ref }: { ref?: Ref<HTMLElement> }) {
  return (
    <aside ref={ref} className={styles.finale} aria-labelledby="finale-title">
      <p className={styles.finaleEyebrow}>The artist behind {GALLERY.name}</p>
      <h2 id="finale-title" className={styles.finaleName}>
        {ARTIST.name}
      </h2>
      <div className={styles.panelDivider} aria-hidden="true">
        <span className={styles.diamond} />
      </div>
      <p className={styles.finaleStatement}>{ARTIST.statement}</p>
      <div className={styles.finaleActions}>
        <a className={styles.panelNext} href="#collection">
          View the collection <span aria-hidden="true">→</span>
        </a>
        <a className={styles.panelBack} href="#artist">
          About the artist
        </a>
      </div>
    </aside>
  );
}
