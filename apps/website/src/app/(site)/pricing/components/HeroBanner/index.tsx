import { BRAND_LOGO } from '@/lib/brand-logos';
import { HERO_COPY, HERO_TRUST_POINTS } from './constants';
import { PricingHeroVisual } from './PricingHeroVisual';
import styles from './index.module.css';

const LOGO = BRAND_LOGO.onLightBg;

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="pricing-hero-heading">
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.logoRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="" className={styles.logo} aria-hidden="true" />
            <p className={styles.eyebrow}>{HERO_COPY.eyebrow}</p>
          </div>

          <h1 id="pricing-hero-heading" className={styles.headline}>
            {HERO_COPY.headline}
            <br />
            <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
          </h1>

          <p className={styles.description}>{HERO_COPY.description}</p>

          <ul className={styles.trustList}>
            {HERO_TRUST_POINTS.map((point) => (
              <li key={point} className={styles.trustItem}>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.visual}>
          <PricingHeroVisual />
          <span className="sr-only">
            Autolokate pricing — one year cover with Smart QR sticker included
          </span>
        </div>
      </div>
    </section>
  );
}
