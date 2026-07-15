import { HeroAppMockup } from './HeroAppMockup';
import { HeroCtas } from './HeroCtas';
import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgScrim} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.copyText}>
            <span className={styles.badge}>{HERO_COPY.badge}</span>

            <h1 id="home-hero-heading" className={styles.headline}>
              {HERO_COPY.headline}{' '}
              <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
            </h1>

            <p className={styles.subheading}>{HERO_COPY.subheading}</p>
          </div>

          <HeroCtas />
        </div>

        <div className={styles.mockup}>
          <HeroAppMockup />
        </div>
      </div>
    </section>
  );
}
