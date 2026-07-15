'use client';

import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroCta() {
  return (
    <AlButton
      size="lg"
      radius="lg"
      variant="primary"
      className={styles.cta}
      icon={<ArrowRight className="h-4 w-4" />}
      iconPosition="end"
      onClick={() => {
        window.location.href = HERO_COPY.cta.href;
      }}
    >
      {HERO_COPY.cta.label}
    </AlButton>
  );
}
