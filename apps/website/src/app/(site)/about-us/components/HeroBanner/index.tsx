import Link from 'next/link';
import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  const { eyebrow, headline, headlineAccent, description } = HERO_COPY;

  return (
    <section className={styles.hero} aria-labelledby="about-hero-heading">
      <div className={styles.glow} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h1 id="about-hero-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h1>

          <p className={styles.description}>{description}</p>

          <div className={styles.actions}>
            <Link href="/pricing" className={styles.primaryCta}>
              Get protected
            </Link>
            <Link href="/how-it-works" className={styles.secondaryCta}>
              See how it works
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
