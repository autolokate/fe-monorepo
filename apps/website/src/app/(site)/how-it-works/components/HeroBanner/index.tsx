import Image from 'next/image';
import { HeroCta } from './HeroCta';
import { HERO_COPY, HERO_PHONE_IMAGE } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="how-hero-heading">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {HERO_COPY.eyebrow}
          </p>

          <h1 id="how-hero-heading" className={styles.headline}>
            {HERO_COPY.headline}
            <br />
            {HERO_COPY.headlineRest}{' '}
            <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
          </h1>

          <p className={styles.description}>{HERO_COPY.description}</p>
          <p className={styles.microcopy}>{HERO_COPY.microcopy}</p>

          <HeroCta />
        </div>

        <div className={styles.scene}>
          <Image
            src={HERO_PHONE_IMAGE}
            alt="Autolokate how it works: crash detection, cancel window, Control Center, help dispatched, and Smart QR backup"
            width={853}
            height={1844}
            priority
            className={styles.phone}
          />
        </div>
      </div>
    </section>
  );
}
