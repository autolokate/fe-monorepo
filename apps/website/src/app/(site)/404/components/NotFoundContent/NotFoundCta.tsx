'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { NOT_FOUND_COPY } from './constants';
import styles from './index.module.css';

export function NotFoundCta() {
  const router = useRouter();

  return (
    <div className={styles.ctas}>
      <AlButton
        size="lg"
        variant="secondary"
        radius="lg"
        className={styles.ctaSecondary}
        onClick={() => {
          router.push(NOT_FOUND_COPY.secondaryCta.href);
        }}
      >
        {NOT_FOUND_COPY.secondaryCta.label}
      </AlButton>

      <AlButton
        size="lg"
        variant="primary"
        radius="lg"
        className={styles.ctaPrimary}
        icon={<ArrowRight className="h-4 w-4" aria-hidden />}
        iconPosition="end"
        onClick={() => {
          router.push(NOT_FOUND_COPY.primaryCta.href);
        }}
      >
        {NOT_FOUND_COPY.primaryCta.label}
      </AlButton>
    </div>
  );
}
