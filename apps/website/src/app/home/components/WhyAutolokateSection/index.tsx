import { BeyondCta } from './BeyondCta';
import { FeatureTile } from './FeatureTile';
import { WHY_AUTOLOKATE_COPY, WHY_HIGHLIGHTS } from './constants';
import styles from './index.module.css';

export function WhyAutolokateSection() {
  const { eyebrow, headline, headlineAccent, headlineSuffix, subheadline } = WHY_AUTOLOKATE_COPY;

  return (
    <section aria-labelledby="beyond-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowIndex} aria-hidden="true">
              05
            </span>
            {eyebrow}
          </p>
          <h2 id="beyond-heading" className={styles.headline}>
            {headline}
            <span className={styles.headlineAccent}>{headlineAccent}</span>
            {headlineSuffix}
          </h2>
          <p className={styles.subheadline}>{subheadline}</p>
        </header>

        <div className={styles.rail}>
          <div className={styles.railLine} aria-hidden="true" />
          <div className={styles.tiles}>
            {WHY_HIGHLIGHTS.map((highlight, index) => (
              <FeatureTile key={highlight.id} highlight={highlight} index={index + 1} />
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
