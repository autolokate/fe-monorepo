import Link from 'next/link';
import { HELP_COPY } from './constants';
import styles from './index.module.css';

export function HelpSection() {
  const { headline, subheading, email } = HELP_COPY;

  return (
    <section className={styles.section} aria-labelledby="shipping-help-heading">
      <div className={styles.inner}>
        <h2 id="shipping-help-heading" className={styles.headline}>
          {headline}
        </h2>
        <p className={styles.subheading}>{subheading}</p>
        <Link href={`mailto:${email}`} className={styles.emailLink}>
          {email}
        </Link>
      </div>
    </section>
  );
}
