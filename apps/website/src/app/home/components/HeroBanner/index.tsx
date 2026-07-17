import Image from 'next/image';
import { HeroCtas } from './HeroCtas';
import { HERO_COPY, HERO_PHONE_IMAGE, HERO_STATS } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="home-hero-heading">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {HERO_COPY.eyebrow}
          </p>

          <h1 id="home-hero-heading" className={styles.headline}>
            {HERO_COPY.headline}{' '}
            <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
          </h1>

          <p className={styles.subheading}>{HERO_COPY.subheading}</p>
          <p className={styles.microcopy}>{HERO_COPY.microcopy}</p>

          <HeroCtas />

          <dl className={styles.stats}>
            {HERO_STATS.map((stat, index) => (
              <div key={stat.id} className={styles.statGroup}>
                {index > 0 ? <span className={styles.statDivider} aria-hidden="true" /> : null}
                <div className={styles.stat}>
                  <dt className={styles.statValue}>{stat.value}</dt>
                  <dd className={styles.statLabel}>{stat.label}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className={styles.scene}>
          <Image
            src={HERO_PHONE_IMAGE}
            alt="Autolokate app showing live crash protection with an ambulance dispatched"
            width={492}
            height={752}
            priority
            className={styles.phone}
          />
        </div>
      </div>
    </section>
  );
}
