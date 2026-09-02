import { WifiOff } from 'lucide-react';
import { OFFLINE_COPY } from './constants';
import { OfflineCta } from './OfflineCta';
import type { OfflineContentProps } from './types';
import styles from './index.module.css';

export function OfflineContent({ onTryAgain }: OfflineContentProps) {
  const { eyebrow, headline, description } = OFFLINE_COPY;

  return (
    <section className={styles.message} aria-labelledby="offline-heading">
      <div className={styles.glyph} aria-hidden="true">
        <WifiOff className={styles.glyphIcon} />
      </div>

      <p className={styles.eyebrow}>
        <span className={styles.eyebrowDash} aria-hidden="true" />
        {eyebrow}
      </p>

      <h1 id="offline-heading" className={styles.headline}>
        {headline}
      </h1>

      <p className={styles.description}>{description}</p>

      <OfflineCta onTryAgain={onTryAgain} />
    </section>
  );
}
