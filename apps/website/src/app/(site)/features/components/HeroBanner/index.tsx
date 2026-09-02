import { HeroCta } from './HeroCta';
import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="features-hero-heading">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDash} aria-hidden="true" />
          {HERO_COPY.eyebrow}
        </p>

        <h1 id="features-hero-heading" className={styles.headline}>
          {HERO_COPY.headline}
          <br />
          <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
        </h1>

        <p className={styles.description}>{HERO_COPY.description}</p>

        <p className={styles.note}>{HERO_COPY.note}</p>

        <HeroCta />
      </div>
    </section>
  );
}
