import type { Ref } from "react";
import type { Painting } from "@/types/artwork";
import { formatCreationDate } from "@/content/paintings";
import styles from "./overlay.module.css";

/**
 * Information about the painting in focus. Visibility is driven by the scroll
 * timeline (GSAP autoAlpha), which also removes it from the tab order while hidden.
 */
export function PaintingInformation({
  ref,
  painting,
  number,
  continueLabel,
  onContinue,
}: {
  ref?: Ref<HTMLElement>;
  painting: Painting;
  number: number;
  continueLabel: string;
  onContinue: () => void;
}) {
  const facts: [string, string][] = [];
  if (painting.medium) facts.push(["Medium", painting.medium]);
  if (painting.creationDate) facts.push(["Created", formatCreationDate(painting.creationDate)]);
  if (painting.dimensions) facts.push(["Dimensions", painting.dimensions]);

  return (
    <aside ref={ref} className={styles.panel} aria-labelledby={`panel-${painting.id}`}>
      {painting.isPlaceholder && <p className={styles.panelBadge}>Example entry · replace with your painting</p>}
      <p className={styles.panelEyebrow}>No. {String(number).padStart(2, "0")}</p>
      <h2 id={`panel-${painting.id}`} className={styles.panelTitle}>
        {painting.title}
      </h2>
      {painting.description && <p className={styles.panelDescription}>{painting.description}</p>}
      {facts.length > 0 && (
        <dl className={styles.panelFacts}>
          {facts.map(([term, value]) => (
            <div key={term} className={styles.panelFact}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className={styles.panelActions}>
        <button type="button" className={styles.panelButton} onClick={onContinue}>
          {continueLabel}
        </button>
        <a className={styles.panelLink} href={`#artwork-${painting.id}`}>
          Details
        </a>
      </div>
    </aside>
  );
}
