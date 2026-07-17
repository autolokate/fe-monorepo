'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { CLOSING_CTA_COPY } from './constants';
import styles from './index.module.css';

export function ClosingCta() {
  const router = useRouter();

  return (
    <AlButton
      size="lg"
      variant="primary"
      radius="lg"
      className={styles.cta}
      icon={<ArrowRight className="h-4 w-4" aria-hidden />}
      iconPosition="end"
      onClick={() => {
        router.push(CLOSING_CTA_COPY.cta.href);
      }}
    >
      {CLOSING_CTA_COPY.cta.label}
    </AlButton>
  );
}
