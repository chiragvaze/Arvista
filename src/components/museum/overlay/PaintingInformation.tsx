import type { Ref } from "react";
import type { Painting } from "@/types/artwork";
import { formatCreationDate } from "@/content/paintings";
import { ARTIST } from "@/content/site";
import styles from "./overlay.module.css";

/** Splits a description into its opening line (set as an italic lead) and the remaining text. */
export function splitDescription(description: string | undefined): { lead?: string; body?: string } {
  if (!description) return {};
  const [lead, ...rest] = description.split("\n");
  const body = rest.join("\n").trim();
  return { lead: lead.trim(), body: body || undefined };
}

/**
 * The exhibition label for the painting in focus: number, title, description,
 * metadata and navigation, set as an ivory card beside the artwork. Visibility
 * is driven by the scroll timeline (GSAP autoAlpha), which also removes the
 * card from the tab order while hidden.
 */
export function PaintingInformation({
  ref,
  painting,
  number,
  total,
  previousLabel,
  continueLabel,
  onPrevious,
  onContinue,
}: {
  ref?: Ref<HTMLElement>;
  painting: Painting;
  number: number;
  total: number;
  previousLabel: string;
  continueLabel: string;
  onPrevious: () => void;
  onContinue: () => void;
}) {
  const { lead, body } = splitDescription(painting.description);
  const facts: [string, string][] = [];
  if (painting.medium) facts.push(["Medium", painting.medium]);
  if (painting.creationDate) facts.push(["Created", formatCreationDate(painting.creationDate)]);
  if (painting.dimensions) facts.push(["Dimensions", painting.dimensions]);
  facts.push(["Artist", painting.artist ?? ARTIST.name]);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <aside ref={ref} className={styles.panel} aria-labelledby={`panel-${painting.id}`}>
      <p className={styles.panelIndex}>
        <span>
          {pad(number)} / {pad(total)}
        </span>
        <span className={styles.panelRule} aria-hidden="true" />
        <span className={styles.diamond} aria-hidden="true" />
      </p>
      {painting.isPlaceholder && <p className={styles.panelBadge}>Example entry · replace with your painting</p>}
      <h2 id={`panel-${painting.id}`} className={styles.panelTitle}>
        {painting.title}
      </h2>
      {lead && <p className={styles.panelLead}>{lead}</p>}
      {body && <p className={styles.panelBody}>{body}</p>}
      <div className={styles.panelDivider} aria-hidden="true">
        <span className={styles.diamond} />
      </div>
      <dl className={styles.panelFacts}>
        {facts.map(([term, value]) => (
          <div key={term} className={styles.panelFact}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.panelActions}>
        <button type="button" className={styles.panelBack} onClick={onPrevious}>
          <span aria-hidden="true">←</span> {previousLabel}
        </button>
        <button type="button" className={styles.panelNext} onClick={onContinue}>
          {continueLabel} <span aria-hidden="true">→</span>
        </button>
      </div>
    </aside>
  );
}
