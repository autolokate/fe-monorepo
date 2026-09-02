import { Fragment } from 'react';
import { FAQS, FAQ_COPY } from './constants';
import styles from './index.module.css';

export function FaqGrid() {
  const { eyebrow, headline, headlineAccent } = FAQ_COPY;

  return (
    <section aria-labelledby="about-faq-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="about-faq-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>
        </header>

        <dl className={styles.questions}>
          {FAQS.map((faq, index) => (
            <Fragment key={faq.id}>
              {index > 0 && <span className={styles.divider} aria-hidden="true" />}
              <div className={styles.item}>
                <dt className={styles.question}>{faq.question}</dt>
                <dd className={styles.answer}>{faq.answer}</dd>
              </div>
            </Fragment>
          ))}
        </dl>
      </div>
    </section>
  );
}
