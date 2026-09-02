import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  const { eyebrow, headline, headlineAccent, description, callout } = HERO_COPY;

  return (
    <section className={styles.hero} aria-labelledby="media-hero-heading">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.headGroup}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h1 id="media-hero-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h1>
        </div>

        <p className={styles.description}>{description}</p>
        <p className={styles.callout}>{callout}</p>
      </div>
    </section>
  );
}
