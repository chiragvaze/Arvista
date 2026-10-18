import { ARTIST, GALLERY } from "@/content/site";
import styles from "./ArtistSection.module.css";

/** Closing section of the page: the artist behind the gallery. The statement is draft copy from content/site.ts. */
export function ArtistSection() {
  return (
    <section id="artist" className={styles.artist} aria-labelledby="artist-title" tabIndex={-1}>
      <p className={styles.eyebrow}>The artist behind {GALLERY.name}</p>
      <h2 id="artist-title" className={styles.name}>
        {ARTIST.name}
      </h2>
      <div className={styles.divider} aria-hidden="true">
        <span className={styles.diamond} />
      </div>
      <p className={styles.statement}>{ARTIST.statement}</p>
      <nav className={styles.links} aria-label="Return">
        <a href="#collection">The collection</a>
        <a href="#top">Return to the entrance</a>
      </nav>
      <p className={styles.footer}>
        {GALLERY.name} · {GALLERY.subtitle}
      </p>
    </section>
  );
}
