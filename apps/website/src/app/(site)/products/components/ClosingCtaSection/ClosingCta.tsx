'use client';

import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { CLOSING_CTA_COPY } from './constants';
import styles from './index.module.css';

export function ClosingCta() {
  return (
    <AlButton
      size="lg"
      variant="primary"
      radius="lg"
      className={styles.cta}
      icon={<ArrowRight className="h-4 w-4" aria-hidden />}
      iconPosition="end"
      onClick={() => {
        window.open(CLOSING_CTA_COPY.cta.href, '_blank', 'noopener,noreferrer');
      }}
    >
      {CLOSING_CTA_COPY.cta.label}
    </AlButton>
  );
}
