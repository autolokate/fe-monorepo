import Image from 'next/image';
import { PRODUCTS_HERO } from './constants';
import styles from './hero.module.css';

export function ProductsHero() {
  const { eyebrow, headline, headlineLine2, body, image, imageAlt } = PRODUCTS_HERO;

  return (
    <section className={styles.section} aria-labelledby="products-hero-heading">
      <div className={styles.media} aria-hidden="true">
        <Image src={image} alt="" fill priority className={styles.image} sizes="100vw" />
        <div className={styles.scrim} />
      </div>

      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          <span className={styles.eyebrowLine} aria-hidden="true" />
          {eyebrow}
        </p>
        <h1 id="products-hero-heading" className={styles.headline}>
          {headline}
          <br />
          <span className={styles.headlineMuted}>{headlineLine2}</span>
        </h1>
        <p className={styles.body}>{body}</p>
      </div>

      <span className="sr-only">{imageAlt}</span>
    </section>
  );
}
