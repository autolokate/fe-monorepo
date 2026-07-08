import { HeroCarousel } from "./HeroCarousel";
import styles from "./index.module.css";

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-label="How Autolokate protection works">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgScrim} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <HeroCarousel />
      </div>
    </section>
  );
}
