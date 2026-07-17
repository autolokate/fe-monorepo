'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import { OFFLINE_COPY } from './constants';
import styles from './index.module.css';

interface OfflineCtaProps {
  onTryAgain?: () => void;
}

export function OfflineCta({ onTryAgain }: OfflineCtaProps) {
  const router = useRouter();

  return (
    <div className={styles.ctas}>
      <AlButton
        size="lg"
        variant="secondary"
        radius="lg"
        className={styles.ctaSecondary}
        onClick={() => {
          router.push(OFFLINE_COPY.secondaryCta.href);
        }}
      >
        {OFFLINE_COPY.secondaryCta.label}
      </AlButton>

      <AlButton
        size="lg"
        variant="primary"
        radius="lg"
        className={styles.ctaPrimary}
        icon={<RefreshCw className="h-4 w-4" aria-hidden />}
        iconPosition="end"
        onClick={() => {
          if (onTryAgain) {
            onTryAgain();
            return;
          }

          router.refresh();
        }}
      >
        {OFFLINE_COPY.primaryCta.label}
      </AlButton>
    </div>
  );
}
