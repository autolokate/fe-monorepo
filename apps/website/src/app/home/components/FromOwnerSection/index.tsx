import { FROM_OWNER_COPY } from './constants';
import styles from './index.module.css';

export function FromOwnerSection() {
  const { eyebrow, quote, founder } = FROM_OWNER_COPY;

  return (
    <section id="from-owner" aria-labelledby="from-owner-heading" className={styles.section}>
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowDash} aria-hidden="true" />
          {eyebrow}
        </p>

        <blockquote id="from-owner-heading" className={styles.quote}>
          {quote}
        </blockquote>

        <div className={styles.byline}>
          <span className={styles.avatar} aria-hidden="true">
            {founder.initials}
          </span>
          <div className={styles.attribution}>
            <p className={styles.name}>{founder.name}</p>
            <p className={styles.title}>{founder.title}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
