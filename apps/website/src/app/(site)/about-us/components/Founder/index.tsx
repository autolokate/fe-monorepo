import { FOUNDER_COPY } from './constants';
import styles from './index.module.css';

export function Founder() {
  const { eyebrow, quote, initials, name, role } = FOUNDER_COPY;

  return (
    <section aria-labelledby="founder-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.headerStack}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <blockquote id="founder-heading" className={styles.quote}>
            {quote}
          </blockquote>
        </div>

        <div className={styles.byline}>
          <span className={styles.avatar} aria-hidden="true">
            {initials}
          </span>
          <div className={styles.attribution}>
            <p className={styles.name}>{name}</p>
            <p className={styles.role}>{role}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
