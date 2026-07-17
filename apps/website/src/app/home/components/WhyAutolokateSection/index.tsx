import { BeyondCta } from './BeyondCta';
import { HighlightCard } from './HighlightCard';
import { WHY_AUTOLOKATE_COPY, WHY_HIGHLIGHTS } from './constants';
import styles from './index.module.css';

export function WhyAutolokateSection() {
  const { eyebrow, headline, headlineAccent, headlineSuffix, subheadline } = WHY_AUTOLOKATE_COPY;
  const stacked = WHY_HIGHLIGHTS.filter((item) => item.layout === 'stacked');
  const wide = WHY_HIGHLIGHTS.filter((item) => item.layout === 'wide');

  return (
    <section aria-labelledby="beyond-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="beyond-heading" className={styles.headline}>
            {headline}
            <span className={styles.headlineAccent}>{headlineAccent}</span>
            {headlineSuffix}
          </h2>
          <p className={styles.subheadline}>{subheadline}</p>
        </header>

        <div className={styles.grid}>
          <div className={styles.rowStacked}>
            {stacked.map((highlight) => (
              <HighlightCard key={highlight.id} highlight={highlight} />
            ))}
          </div>
          <div className={styles.rowWide}>
            {wide.map((highlight) => (
              <HighlightCard key={highlight.id} highlight={highlight} />
            ))}
          </div>
        </div>

        <div className={styles.ctaRow}>
          <BeyondCta />
        </div>
      </div>
    </section>
  );
}
