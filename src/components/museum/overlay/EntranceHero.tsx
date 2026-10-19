import type { Ref } from "react";
import { ARTIST, GALLERY } from "@/content/site";
import styles from "./overlay.module.css";
import { ScrollIndicator } from "./ScrollIndicator";

/**
 * Overlay for the closed doors. The museum name is carved into the 3D entrance
 * above the doors, so the page heading is kept for screen readers only; the
 * artist attribution, tagline and scroll cue sit quietly at the foot of the
 * view. Faded out by the scroll timeline as the doors open.
 */
export function EntranceHero({ ref }: { ref?: Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} className={styles.hero}>
      <h1 className={styles.visuallyHidden} tabIndex={-1}>
        {GALLERY.name} — {GALLERY.subtitle}. {ARTIST.attribution}.
      </h1>
      <p className={styles.heroAttribution} aria-hidden="true">
        {ARTIST.attribution}
      </p>
      <p className={styles.heroTagline}>{GALLERY.tagline}</p>
      <ScrollIndicator />
    </div>
  );
}
