import { RESPONSE_BRANCHES, RESPONSE_COPY, RESPONSE_SOURCE } from './constants';
import styles from './index.module.css';

export function OnGroundResponseSection() {
  const { eyebrow, headline, headlineAccent, subheading, footnote } = RESPONSE_COPY;

  return (
    <section
      aria-labelledby="response-heading"
      className={`mkt-section mkt-lightBg ${styles.section}`}
    >
      <div className={`mkt-container ${styles.inner}`}>
        <header className={styles.header}>
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="response-heading" className={`mkt-headline ${styles.headline}`}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={`mkt-body ${styles.subheading}`}>{subheading}</p>
        </header>

        <div className={styles.chain}>
          <article className={styles.source}>
            <span className={styles.phase}>Dispatch</span>
            <div className={styles.copy}>
              <h3 className={styles.itemTitle}>{RESPONSE_SOURCE.title}</h3>
              <p className={styles.itemBody}>{RESPONSE_SOURCE.body}</p>
            </div>
          </article>

          <ul className={styles.branches}>
            {RESPONSE_BRANCHES.map((branch, index) => (
              <li key={branch.id} className={styles.branch}>
                <span className={styles.phase}>{String(index + 1).padStart(2, '0')}</span>
                <div className={styles.copy}>
                  <h3 className={styles.itemTitle}>{branch.title}</h3>
                  <p className={styles.itemBody}>{branch.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className={styles.footnote}>{footnote}</p>
      </div>
    </section>
  );
}
