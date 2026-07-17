/* eslint-disable @next/next/no-img-element -- static India map SVG; next/image adds no benefit for inline SVG */
import { INDIA_MAP_IMAGE, WHY_IT_MATTERS_COPY } from './constants';
import styles from './index.module.css';

export function WhyItMattersSection() {
  const { eyebrow, headline, headlineAccent, stat, body, callout, map } = WHY_IT_MATTERS_COPY;

  return (
    <section aria-labelledby="why-it-matters-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.story}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="why-it-matters-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <div className={styles.statBlock}>
            <p className={styles.statValue}>{stat.value}</p>
            <p className={styles.statLabel}>{stat.label}</p>
            <p className={styles.statSource}>{stat.source}</p>
          </div>

          <p className={styles.body}>{body}</p>

          <p className={styles.callout}>{callout}</p>
        </div>

        <div className={styles.mapColumn}>
          <p className={styles.mapHeading}>{map.heading}</p>
          <img
            src={INDIA_MAP_IMAGE}
            alt="Map of India showing Autolokate coverage"
            className={styles.map}
          />
          <span className={styles.coveragePill}>
            <span className={styles.coverageDot} aria-hidden="true" />
            {map.pill}
          </span>
        </div>
      </div>
    </section>
  );
}
