import Image from "next/image";
import type { Painting } from "@/types/artwork";
import { formatCreationDate } from "@/content/paintings";
import { ARTIST, GALLERY } from "@/content/site";
import { splitDescription } from "@/components/museum/overlay/PaintingInformation";
import styles from "./ArtworkDetails.module.css";

/**
 * The collection as plain, semantic HTML. Always rendered after the walkthrough,
 * so every painting's information is reachable without the 3D scene or scrolling
 * through it (and is what search engines and screen readers see first). Built
 * from the same painting data as the 3D gallery.
 */
export function ArtworkDetails({ paintings }: { paintings: Painting[] }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <section id="collection" className={styles.collection} aria-labelledby="collection-title" tabIndex={-1}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>{GALLERY.name}</p>
        <h2 id="collection-title" className={styles.title}>
          The Collection
        </h2>
        <p className={styles.subtitle}>Paintings by {ARTIST.name}</p>
        <div className={styles.divider} aria-hidden="true">
          <span className={styles.diamond} />
        </div>
      </header>
      {paintings.map((painting, i) => {
        const { lead, body } = splitDescription(painting.description);
        return (
          <article
            key={painting.id}
            id={`artwork-${painting.id}`}
            className={styles.artwork}
            data-reverse={i % 2 === 1 || undefined}
            aria-labelledby={`title-${painting.id}`}
          >
            <figure className={styles.figure}>
              <div className={styles.frame}>
                <div className={styles.mat}>
                  <Image
                    src={painting.image.src}
                    alt={painting.image.alt}
                    width={painting.image.width}
                    height={painting.image.height}
                    sizes="(max-width: 800px) 90vw, 40vw"
                    className={styles.image}
                  />
                </div>
              </div>
            </figure>
            <div className={styles.text}>
              <p className={styles.index}>
                <span>
                  {pad(i + 1)} / {pad(paintings.length)}
                </span>
                <span className={styles.rule} aria-hidden="true" />
                <span className={styles.diamond} aria-hidden="true" />
              </p>
              {painting.isPlaceholder && (
                <p className={styles.badge}>Example entry: this placeholder will be replaced with a real painting</p>
              )}
              <h3 id={`title-${painting.id}`} className={styles.artworkTitle}>
                {painting.title}
              </h3>
              {lead && <p className={styles.lead}>{lead}</p>}
              {body && <p className={styles.body}>{body}</p>}
              <dl className={styles.facts}>
                {painting.medium && (
                  <div>
                    <dt>Medium</dt>
                    <dd>{painting.medium}</dd>
                  </div>
                )}
                {painting.creationDate && (
                  <div>
                    <dt>Created</dt>
                    <dd>
                      <time dateTime={painting.creationDate}>{formatCreationDate(painting.creationDate)}</time>
                    </dd>
                  </div>
                )}
                {painting.dimensions && (
                  <div>
                    <dt>Dimensions</dt>
                    <dd>{painting.dimensions}</dd>
                  </div>
                )}
                <div>
                  <dt>Artist</dt>
                  <dd>{painting.artist ?? ARTIST.name}</dd>
                </div>
              </dl>
              <a className={styles.back} href="#top">
                <span aria-hidden="true">←</span> Return to the entrance
              </a>
            </div>
          </article>
        );
      })}
    </section>
  );
}
