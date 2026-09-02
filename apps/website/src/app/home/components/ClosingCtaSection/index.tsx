import Image from 'next/image';

import { MARKETING_STORY_IMAGES } from '@/lib/marketing-story-images';

import { ClosingCta } from './ClosingCta';
import { CLOSING_CTA_COPY } from './constants';
import styles from './index.module.css';

export function ClosingCtaSection() {
  const { eyebrow, headline, headlineAccent, subheading, features, imageAlt } = CLOSING_CTA_COPY;

  return (
    <section aria-labelledby="closing-cta-heading" className={styles.section}>
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <div className={styles.headingStack}>
            <h2 id="closing-cta-heading" className={styles.headline}>
              {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
            </h2>
            <p className={styles.subheading}>{subheading}</p>
          </div>

          <ul className={styles.features}>
            {features.map((feature) => (
              <li key={feature} className={styles.feature}>
                {feature}
              </li>
            ))}
          </ul>

          <ClosingCta />
        </div>

        <div className={styles.visual}>
          <div className={styles.phoneGlow} aria-hidden="true" />
          <Image
            src={MARKETING_STORY_IMAGES.closingProtectionApp}
            alt={imageAlt}
            width={853}
            height={1844}
            className={styles.phoneImage}
            sizes="(max-width: 1023px) 72vw, 320px"
          />
        </div>
      </div>
    </section>
  );
}
