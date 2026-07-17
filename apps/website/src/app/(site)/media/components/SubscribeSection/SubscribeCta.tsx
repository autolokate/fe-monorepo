'use client';

import { AlButton } from '@autolokate/ui/button';
import { SUBSCRIBE_COPY } from './constants';
import styles from './index.module.css';

export function SubscribeCta() {
  return (
    <AlButton
      size="lg"
      variant="secondary"
      radius="lg"
      className={styles.cta}
      onClick={() => {
        window.open(SUBSCRIBE_COPY.cta.href, '_blank', 'noopener,noreferrer');
      }}
    >
      {SUBSCRIBE_COPY.cta.label}
    </AlButton>
  );
}
