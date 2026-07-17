import { AlertTriangle } from 'lucide-react';
import { SERVER_ERROR_COPY } from './constants';
import { ServerErrorCta } from './ServerErrorCta';
import type { ServerErrorContentProps } from './types';
import styles from './index.module.css';

export function ServerErrorContent({ onTryAgain }: ServerErrorContentProps) {
  const { eyebrow, headline, description } = SERVER_ERROR_COPY;

  return (
    <section className={styles.message} aria-labelledby="server-error-heading">
      <div className={styles.glyph} aria-hidden="true">
        <AlertTriangle className={styles.glyphIcon} />
      </div>

      <p className={styles.eyebrow}>
        <span className={styles.eyebrowDash} aria-hidden="true" />
        {eyebrow}
      </p>

      <h1 id="server-error-heading" className={styles.headline}>
        {headline}
      </h1>

      <p className={styles.description}>{description}</p>

      <ServerErrorCta onTryAgain={onTryAgain} />
    </section>
  );
}
