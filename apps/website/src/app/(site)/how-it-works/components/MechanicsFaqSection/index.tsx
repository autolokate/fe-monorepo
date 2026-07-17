import Link from 'next/link';
import { MECHANICS_FAQS, MECHANICS_FAQ_COPY } from './constants';
import styles from './index.module.css';

export function MechanicsFaqSection() {
  const { eyebrow, headline, headlineAccent, note, noteLink } = MECHANICS_FAQ_COPY;

  return (
    <section aria-labelledby="mechanics-faq-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="mechanics-faq-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>
        </header>

        <dl className={styles.list}>
          {MECHANICS_FAQS.map((item) => (
            <div key={item.id} className={styles.item}>
              <dt className={styles.question}>{item.question}</dt>
              <dd className={styles.answer}>{item.answer}</dd>
            </div>
          ))}
        </dl>

        <p className={styles.note}>
          {note}{' '}
          <Link href={noteLink.href} className={styles.noteLink}>
            {noteLink.label}
          </Link>
        </p>
      </div>
    </section>
  );
}
