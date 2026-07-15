'use client';

import { useRouter } from 'next/navigation';
import { AlButton } from '@autolokate/ui/button';
import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroCtas() {
  const router = useRouter();

  return (
    <div className={styles.ctas}>
      <AlButton
        size="md"
        className={styles.ctaPrimary}
        variant="primary"
        onClick={() => {
          router.push(HERO_COPY.primaryCta.href);
        }}
      >
        {HERO_COPY.primaryCta.label}
      </AlButton>
      <AlButton
        size="md"
        variant="outline"
        className={styles.ctaSecondary}
        onClick={() => {
          if (HERO_COPY.secondaryCta.href) {
            router.push(HERO_COPY.secondaryCta.href);
          }
        }}
      >
        {HERO_COPY.secondaryCta.label}
      </AlButton>
    </div>
  );
}
