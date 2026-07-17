import { BELIEF_TILES, PHILOSOPHY_COPY } from './constants';
import styles from './index.module.css';

export function Philosophy() {
  const { eyebrow, headline, headlineAccent, subheading } = PHILOSOPHY_COPY;

  return (
    <section aria-labelledby="beliefs-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="beliefs-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <ul className={styles.tiles}>
          {BELIEF_TILES.map((tile) => (
            <li key={tile.id} className={styles.tile}>
              <h3 className={styles.tileTitle}>{tile.title}</h3>
              <p className={styles.tileBody}>{tile.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
