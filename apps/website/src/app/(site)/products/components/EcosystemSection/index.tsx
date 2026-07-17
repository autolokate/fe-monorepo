import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ECOSYSTEM_AUDIENCES, ECOSYSTEM_COPY } from './constants';
import styles from './index.module.css';

export function EcosystemSection() {
  return (
    <section className={styles.section} aria-labelledby="ecosystem-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {ECOSYSTEM_COPY.eyebrow}
          </p>
          <h2 id="ecosystem-heading" className={styles.heading}>
            {ECOSYSTEM_COPY.heading}{' '}
            <span className={styles.headingAccent}>{ECOSYSTEM_COPY.headingAccent}</span>
          </h2>
          <p className={styles.subheading}>{ECOSYSTEM_COPY.subheading}</p>
        </header>

        <ul className={styles.audiences}>
          {ECOSYSTEM_AUDIENCES.map(({ id, title, description, Icon }) => (
            <li key={id} className={styles.audience}>
              <span className={styles.node} aria-hidden="true">
                <Icon className="h-5 w-5" strokeWidth={1.8} />
              </span>
              <div className={styles.copy}>
                <h3 className={styles.audienceTitle}>{title}</h3>
                <p className={styles.audienceBody}>{description}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className={styles.footnote}>{ECOSYSTEM_COPY.footnote}</p>

        <Link href={ECOSYSTEM_COPY.link.href} className={styles.link}>
          {ECOSYSTEM_COPY.link.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
