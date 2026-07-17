import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  const { eyebrow, headline, status, description } = HERO_COPY;

  return (
    <section className={styles.hero} aria-labelledby="refund-hero-heading">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDash} aria-hidden="true" />
          {eyebrow}
        </p>

        <h1 id="refund-hero-heading" className={styles.headline}>
          {headline}
        </h1>

        <p className={styles.status}>{status}</p>

        <p className={styles.description}>{description}</p>
      </div>
    </section>
  );
}
