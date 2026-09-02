import { NOT_FOUND_COPY } from './constants';
import { NotFoundCta } from './NotFoundCta';
import styles from './index.module.css';

export function NotFoundContent() {
  const { eyebrow, codePrefix, codeAccent, codeSuffix, headline, description } = NOT_FOUND_COPY;

  return (
    <section className={styles.message} aria-labelledby="not-found-heading">
      <p className={styles.code} aria-hidden="true">
        <span>{codePrefix}</span>
        <span className={styles.codeAccent}>{codeAccent}</span>
        <span>{codeSuffix}</span>
      </p>

      <p className={styles.eyebrow}>
        <span className={styles.eyebrowDash} aria-hidden="true" />
        {eyebrow}
      </p>

      <h1 id="not-found-heading" className={styles.headline}>
        {headline}
      </h1>

      <p className={styles.description}>{description}</p>

      <NotFoundCta />
    </section>
  );
}
