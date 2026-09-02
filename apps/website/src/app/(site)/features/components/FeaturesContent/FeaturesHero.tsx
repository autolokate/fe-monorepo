import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FEATURES_HERO, FEATURES_HERO_STATS } from './constants';
import styles from './hero.module.css';

export function FeaturesHero() {
  const { eyebrow, headline, headlineLine2, body, image, imageAlt, primaryCta, secondaryCta } =
    FEATURES_HERO;

  return (
    <section className={styles.section} aria-labelledby="features-hero-heading">
      <div className={styles.media} aria-hidden="true">
        <Image
          src={image}
          alt=""
          fill
          priority
          quality={100}
          unoptimized
          className={styles.image}
          sizes="(min-width: 1920px) 2560px, 100vw"
        />
        <div className={styles.scrim} />
        <div className={styles.sheen} />
      </div>

      <div className={styles.inner}>
        <p className={`${styles.eyebrow} ${styles.enter}`}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 id="features-hero-heading" className={`${styles.headline} ${styles.enterDelay1}`}>
          {headline}
          <br />
          <span className={styles.headlineMuted}>{headlineLine2}</span>
        </h1>
        <p className={`${styles.body} ${styles.enterDelay2}`}>{body}</p>

        <div
          className={`${styles.stats} ${styles.enterDelay3}`}
          role="list"
          aria-label="App highlights"
        >
          {FEATURES_HERO_STATS.map((stat) => (
            <div key={stat.label} className={styles.stat} role="listitem">
              <p className={styles.statValue}>{stat.value}</p>
              <p className={styles.statLabel}>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className={`${styles.ctas} ${styles.enterDelay4}`}>
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
