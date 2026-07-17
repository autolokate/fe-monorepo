'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroCtas() {
  const router = useRouter();

  return (
    <div className={styles.ctas}>
      <AlButton
        size="md"
        variant="outline"
        radius="lg"
        className={styles.ctaSecondary}
        onClick={() => {
          router.push(HERO_COPY.secondaryCta.href);
        }}
      >
        {HERO_COPY.secondaryCta.label}
      </AlButton>
      <AlButton
        size="md"
        variant="primary"
        radius="lg"
        className={styles.ctaPrimary}
        icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        iconPosition="end"
        onClick={() => {
          router.push(HERO_COPY.primaryCta.href);
        }}
      >
        {HERO_COPY.primaryCta.label}
      </AlButton>
    </div>
  );
}
