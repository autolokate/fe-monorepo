import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INSURANCE_BENEFITS, INSURANCE_COPY } from './constants';
import styles from './index.module.css';

export function InsuranceBenefitsSection() {
  const { eyebrow, headline, headlineAccent, subheading, compareLink } = INSURANCE_COPY;

  return (
    <section
      aria-labelledby="insurance-heading"
      className={`mkt-section mkt-mutedBg ${styles.section}`}
    >
      <div className={`mkt-container ${styles.inner}`}>
        <div className={`mkt-split ${styles.split}`}>
          <header className={styles.header}>
            <p className="mkt-eyebrow">
              <span className="mkt-eyebrowLine" aria-hidden="true" />
              {eyebrow}
            </p>

            <h2 id="insurance-heading" className={`mkt-headline ${styles.headline}`}>
              {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
            </h2>

            <p className={`mkt-body ${styles.subheading}`}>{subheading}</p>

            <Link href={compareLink.href} className={styles.compareLink}>
              {compareLink.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </header>

          <ol className={styles.benefits}>
            {INSURANCE_BENEFITS.map((benefit, index) => (
              <li key={benefit.id} className={styles.benefit}>
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                <div className={styles.benefitCopy}>
                  <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                  <p className={styles.benefitBody}>{benefit.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
