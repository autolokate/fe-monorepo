'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { FEATURES_CLOSING } from './constants';
import styles from './closing.module.css';

export function FeaturesClosing() {
  const router = useRouter();
  const { headline, headlineAccent, subheading, primaryCta, secondaryCta } = FEATURES_CLOSING;

  return (
    <section className={styles.section} aria-labelledby="features-closing-heading">
      <div className={styles.inner}>
        <h2 id="features-closing-heading" className={styles.headline}>
          {headline}
          <br />
          <span className={styles.accent}>{headlineAccent}</span>
        </h2>
        <p className={styles.body}>{subheading}</p>
        <div className={styles.ctas}>
          <AlButton
            size="lg"
            variant="primary"
            radius="lg"
            className={styles.ctaPrimary}
            icon={<ArrowRight className="h-4 w-4" aria-hidden />}
            iconPosition="end"
            onClick={() => {
              router.push(primaryCta.href);
            }}
          >
            {primaryCta.label}
          </AlButton>
          <Link href={secondaryCta.href} className={styles.ctaSecondary}>
            {secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
