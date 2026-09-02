import { HERO_COPY } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  const { eyebrow, headline, headlineAccent, description } = HERO_COPY;

  return (
    <section className={styles.hero} aria-labelledby="blog-hero-heading">
      <div className={styles.inner}>
        <div className={styles.headGroup}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h1 id="blog-hero-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h1>
        </div>

        <p className={styles.description}>{description}</p>
      </div>
    </section>
  );
}
