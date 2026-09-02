import { CompareCta } from './CompareCta';
import { PlanGrid } from './PlanGrid';
import { SAFETY_PACKS_COPY, SAFETY_PACKS_SECTION_ID } from './constants';
import styles from './grid.module.css';

export function SafetyPacksSection() {
  const { eyebrow, headline, headlineAccent, subheading, footnote } = SAFETY_PACKS_COPY;
  const accent = headlineAccent ?? '';
  const headlinePrefix =
    accent && headline.endsWith(accent)
      ? headline.slice(0, headline.length - accent.length)
      : headline;

  return (
    <section
      id={SAFETY_PACKS_SECTION_ID}
      aria-labelledby="safety-packs-heading"
      className={styles.section}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="safety-packs-heading" className={styles.headline}>
            {headlinePrefix}
            {accent ? <span className={styles.headlineAccent}>{accent}</span> : null}
          </h2>
          <p className={styles.subheading}>{subheading}</p>
        </header>

        <PlanGrid />

        {footnote ? <p className={styles.footnote}>{footnote}</p> : null}

        <div className={styles.ctaRow}>
          <CompareCta />
        </div>
      </div>
    </section>
  );
}
