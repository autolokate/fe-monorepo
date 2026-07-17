import { BILLING_FAQS, BILLING_FAQ_COPY } from './constants';
import styles from './index.module.css';

export function BillingFaqSection() {
  const { eyebrow, headline, headlineAccent } = BILLING_FAQ_COPY;

  return (
    <section aria-labelledby="billing-faq-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="billing-faq-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>
        </header>

        <dl className={styles.list}>
          {BILLING_FAQS.map((item) => (
            <div key={item.id} className={styles.item}>
              <dt className={styles.question}>{item.question}</dt>
              <dd className={styles.answer}>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
