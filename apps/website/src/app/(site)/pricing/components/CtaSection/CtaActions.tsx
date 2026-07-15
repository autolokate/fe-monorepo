'use client';

import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { CTA_COPY } from './constants';
import styles from './index.module.css';

export function CtaActions() {
  return (
    <AlButton
      size="lg"
      radius="lg"
      variant="primary"
      className={styles.ctaPrimary}
      icon={<ArrowRight className="h-4 w-4" />}
      iconPosition="end"
      onClick={() => {
        window.location.href = CTA_COPY.cta.href;
      }}
    >
      {CTA_COPY.cta.label}
    </AlButton>
  );
}
