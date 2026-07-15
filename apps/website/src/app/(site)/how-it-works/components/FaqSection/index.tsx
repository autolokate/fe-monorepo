import { ChevronDown } from 'lucide-react';
import { FAQ_COPY, FAQS, type FaqItem } from './constants';
import styles from './index.module.css';

function FaqCard({ item }: { item: FaqItem }) {
  return (
    <details className={styles.item}>
      <summary className={styles.summary}>
        <span>{item.question}</span>
        <ChevronDown className={styles.chevron} aria-hidden />
      </summary>
      <p className={styles.answer}>{item.answer}</p>
    </details>
  );
}

export function FaqSection() {
  return (
    <section className={styles.section} aria-labelledby="faq-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.mark} aria-hidden />
          <h2 id="faq-heading" className={styles.heading}>
            {FAQ_COPY.heading}
          </h2>
        </header>

        <div className={styles.grid}>
          <div className={styles.col}>
            {FAQS.left.map((item) => (
              <FaqCard key={item.id} item={item} />
            ))}
          </div>
          <div className={styles.col}>
            {FAQS.right.map((item) => (
              <FaqCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
