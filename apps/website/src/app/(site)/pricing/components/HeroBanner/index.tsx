import { CircleCheck } from 'lucide-react';
import { HeroCta } from './HeroCta';
import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-label="Autolokate pricing overview">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.scrim} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{HERO_COPY.eyebrow}</span>

          <h1 className={styles.headline}>
            {HERO_COPY.headline}
            <span className={styles.headlineLine}>
              {HERO_COPY.headlineLine2Prefix}
              <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
            </span>
          </h1>

          <p className={styles.description}>{HERO_COPY.description}</p>

          <div className={styles.actions}>
            <HeroCta />
          </div>

          <p className={styles.trust}>
            <span className={styles.trustIcon} aria-hidden>
              <CircleCheck className="h-4 w-4" />
            </span>
            {HERO_COPY.trust}
          </p>
        </div>
      </div>
    </section>
  );
}
