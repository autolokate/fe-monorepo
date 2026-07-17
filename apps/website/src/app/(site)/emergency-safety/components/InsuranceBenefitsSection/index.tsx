import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INSURANCE_BENEFITS, INSURANCE_COPY } from './constants';
import styles from './index.module.css';

export function InsuranceBenefitsSection() {
  const { eyebrow, headline, headlineAccent, subheading, compareLink } = INSURANCE_COPY;

  return (
    <section aria-labelledby="insurance-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="insurance-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <ul className={styles.cards}>
          {INSURANCE_BENEFITS.map((benefit) => {
            const { Icon } = benefit;
            return (
              <li key={benefit.id} className={styles.card}>
                <span className={styles.cardIcon} aria-hidden="true">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </span>
                <h3 className={styles.cardTitle}>{benefit.title}</h3>
                <p className={styles.cardBody}>{benefit.body}</p>
              </li>
            );
          })}
        </ul>

        <Link href={compareLink.href} className={styles.compareLink}>
          {compareLink.label}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
