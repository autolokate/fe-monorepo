'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFeatureCategory } from './features-catalog';
import { FEATURES_SAFETY_DARK } from './constants';
import { FeatureMediaStage } from './FeatureMediaStage';
import { FeaturesReveal } from './FeaturesReveal';
import styles from './safety-dark.module.css';

export function FeaturesSafetyDark() {
  const safety = getFeatureCategory('safety');
  if (!safety) return null;

  const { eyebrow, headline, headlineAccent, body, image, imageAlt, cta } = FEATURES_SAFETY_DARK;
  const SafetyIcon = safety.Icon;

  return (
    <section id={safety.id} className={styles.section} aria-labelledby="features-safety-heading">
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.gridLines} aria-hidden="true" />

      <div className={styles.inner}>
        <FeaturesReveal>
          <div className={styles.visualCol}>
            <FeatureMediaStage
              src={image}
              alt={imageAlt}
              width={1536}
              height={1024}
              variant="safety"
            />
          </div>
        </FeaturesReveal>

        <div className={styles.copyCol}>
          <FeaturesReveal delayMs={90}>
            <header className={styles.header}>
              <p className={styles.eyebrow}>
                <span className={styles.eyebrowLine} aria-hidden="true" />
                {eyebrow}
              </p>
              <h2 id="features-safety-heading" className={styles.headline}>
                {headline} <span className={styles.accent}>{headlineAccent}</span>
              </h2>
              <p className={styles.body}>{body}</p>
            </header>
          </FeaturesReveal>

          <FeaturesReveal delayMs={140}>
            <div className={styles.categoryBadge}>
              <span className={styles.categoryIcon} aria-hidden="true">
                <SafetyIcon className={styles.categoryIconSvg} strokeWidth={1.75} />
              </span>
              <div>
                <p className={styles.categoryLabel}>{safety.title}</p>
                <p className={styles.categorySub}>{safety.subtitle}</p>
              </div>
            </div>
          </FeaturesReveal>

          <FeaturesReveal delayMs={160}>
            <ul className={styles.featureGrid}>
              {safety.items.map((item) => {
                const ItemIcon = item.Icon;
                return (
                  <li key={item.id} className={styles.featureCard}>
                    <span className={styles.featureIcon} aria-hidden="true">
                      <ItemIcon className={styles.featureIconSvg} strokeWidth={1.75} />
                    </span>
                    <div className={styles.featureCopy}>
                      <span className={styles.featureLabel}>{item.label}</span>
                      <span className={styles.featureDetail}>{item.detail}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </FeaturesReveal>

          <FeaturesReveal delayMs={420}>
            <Link href={cta.href} className={styles.cta}>
              {cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </FeaturesReveal>
        </div>
      </div>
    </section>
  );
}
