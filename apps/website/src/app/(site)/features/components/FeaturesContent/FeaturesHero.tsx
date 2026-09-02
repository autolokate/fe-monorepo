import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FEATURES_HERO } from './constants';
import styles from './hero.module.css';

export function FeaturesHero() {
  const { eyebrow, headline, headlineLine2, body, image, imageAlt, primaryCta, secondaryCta } =
    FEATURES_HERO;

  return (
    <section className={styles.section} aria-labelledby="features-hero-heading">
      <div className={styles.media} aria-hidden="true">
        <Image src={image} alt="" fill priority className={styles.image} sizes="100vw" />
        <div className={styles.scrim} />
      </div>

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 id="features-hero-heading" className={styles.headline}>
          {headline}
          <br />
          <span className={styles.headlineMuted}>{headlineLine2}</span>
        </h1>
        <p className={styles.body}>{body}</p>
        <div className={styles.ctas}>
          <Link href={primaryCta.href} className={styles.primary}>
            {primaryCta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link href={secondaryCta.href} className={styles.secondary}>
            {secondaryCta.label}
          </Link>
        </div>
      </div>

      <span className="sr-only">{imageAlt}</span>
    </section>
  );
}
