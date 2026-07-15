import { HERO_COPY } from './constants';
import { StoreBadges } from './StoreBadges';
import styles from './index.module.css';

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-label="Autolokate features overview">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgScrim} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.headline}>
            {HERO_COPY.headline}{' '}
            <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
          </h1>

          <p className={styles.description}>{HERO_COPY.description}</p>

          <StoreBadges />
        </div>
      </div>
    </section>
  );
}
