import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ECOSYSTEM_AUDIENCES, ECOSYSTEM_COPY } from './constants';
import styles from './index.module.css';

export function EcosystemSection() {
  return (
    <section
      className={`mkt-section mkt-lightBg ${styles.section}`}
      aria-labelledby="ecosystem-heading"
    >
      <div className={`mkt-container ${styles.inner}`}>
        <header className={styles.header}>
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            {ECOSYSTEM_COPY.eyebrow}
          </p>
          <h2 id="ecosystem-heading" className={`mkt-headline ${styles.heading}`}>
            {ECOSYSTEM_COPY.heading}{' '}
            <span className={styles.headingAccent}>{ECOSYSTEM_COPY.headingAccent}</span>
          </h2>
          <p className={`mkt-body ${styles.subheading}`}>{ECOSYSTEM_COPY.subheading}</p>
        </header>

        <ol className={styles.audiences}>
          {ECOSYSTEM_AUDIENCES.map((audience, index) => (
            <li key={audience.id} className={styles.audience}>
              <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
              <div className={styles.copy}>
                <h3 className={styles.audienceTitle}>{audience.title}</h3>
                <p className={styles.audienceBody}>{audience.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <p className={styles.footnote}>{ECOSYSTEM_COPY.footnote}</p>

        <Link href={ECOSYSTEM_COPY.link.href} className={styles.link}>
          {ECOSYSTEM_COPY.link.label}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
