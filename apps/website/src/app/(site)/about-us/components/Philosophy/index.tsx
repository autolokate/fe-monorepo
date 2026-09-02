import { BELIEF_TILES, PHILOSOPHY_COPY } from './constants';
import styles from './index.module.css';

export function Philosophy() {
  const { eyebrow, headline, headlineAccent, subheading } = PHILOSOPHY_COPY;

  return (
    <section aria-labelledby="beliefs-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="beliefs-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <ol className={styles.beliefs}>
          {BELIEF_TILES.map((tile, index) => (
            <li key={tile.id} className={styles.belief}>
              <span className={styles.beliefIndex} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={styles.beliefContent}>
                <h3 className={styles.beliefTitle}>{tile.title}</h3>
                <p className={styles.beliefBody}>{tile.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
