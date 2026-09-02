import { IMPORTANT_COPY, IMPORTANT_FACTS } from './constants';
import styles from './index.module.css';

export function ImportantToKnow() {
  const { eyebrow, headline, headlineAccent } = IMPORTANT_COPY;

  return (
    <section aria-labelledby="important-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="important-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>
        </header>

        <ul className={styles.facts}>
          {IMPORTANT_FACTS.map((fact) => (
            <li key={fact.id} className={styles.fact}>
              <h3 className={styles.factTitle}>{fact.title}</h3>
              <p className={styles.factBody}>{fact.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
