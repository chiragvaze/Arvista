import Image from "next/image";
import type { Painting } from "@/types/artwork";
import styles from "./ArtworkDetails.module.css";

/**
 * The collection as plain, semantic HTML. Always rendered after the walkthrough,
 * so every painting's information is reachable without the 3D scene or scrolling
 * through it (and is what search engines and screen readers see first).
 */
export function ArtworkDetails({ paintings }: { paintings: Painting[] }) {
  return (
    <section id="collection" className={styles.collection} aria-labelledby="collection-title" tabIndex={-1}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>Arvista</p>
        <h2 id="collection-title" className={styles.title}>
          The Collection
        </h2>
      </header>
      {paintings.map((painting) => (
        <article key={painting.id} id={`artwork-${painting.id}`} className={styles.artwork} aria-labelledby={`title-${painting.id}`}>
          <figure className={styles.figure}>
            <div className={styles.frame}>
              <Image
                src={painting.image.src}
                alt={painting.image.alt}
                width={painting.image.width}
                height={painting.image.height}
                sizes="(max-width: 800px) 90vw, 40vw"
                className={styles.image}
                unoptimized={painting.image.src.endsWith(".svg")}
              />
            </div>
          </figure>
          <div className={styles.text}>
            {painting.isPlaceholder && (
              <p className={styles.badge}>Example entry: this placeholder will be replaced with a real painting</p>
            )}
            <h3 id={`title-${painting.id}`} className={styles.artworkTitle}>
              {painting.title}
            </h3>
            <dl className={styles.facts}>
              {painting.year && (
                <div>
                  <dt>Year</dt>
                  <dd>{painting.year}</dd>
                </div>
              )}
              {painting.medium && (
                <div>
                  <dt>Medium</dt>
                  <dd>{painting.medium}</dd>
                </div>
              )}
              {painting.dimensions && (
                <div>
                  <dt>Dimensions</dt>
                  <dd>{painting.dimensions}</dd>
                </div>
              )}
            </dl>
            {painting.description && <p className={styles.description}>{painting.description}</p>}
            <a className={styles.back} href="#top">
              Return to the entrance
            </a>
          </div>
        </article>
      ))}
    </section>
  );
}
