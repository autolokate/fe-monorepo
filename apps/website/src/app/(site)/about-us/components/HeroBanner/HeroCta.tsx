'use client';

import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { ABOUT_HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroCta() {
  return (
    <div className={styles.ctas}>
      <AlButton
        size="lg"
        radius="lg"
        variant="primary"
        className={styles.ctaPrimary}
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="end"
        onClick={() => {
          window.location.href = ABOUT_HERO_COPY.primaryCta.href;
        }}
      >
        {ABOUT_HERO_COPY.primaryCta.label}
      </AlButton>

      <AlButton
        size="lg"
        radius="lg"
        variant="outline"
        className={styles.ctaSecondary}
        icon={<ArrowRight className="h-4 w-4" />}
        iconPosition="end"
        onClick={() => {
          window.location.href = ABOUT_HERO_COPY.secondaryCta.href;
        }}
      >
        {ABOUT_HERO_COPY.secondaryCta.label}
      </AlButton>
    </div>
  );
}
