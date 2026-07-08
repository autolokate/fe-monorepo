import Image from "next/image";
import { HERO_COPY, HERO_PHONES } from "./constants";
import { StoreBadges } from "./StoreBadges";
import styles from "./index.module.css";

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-label="Autolokate features overview">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgScrim} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.headline}>
            {HERO_COPY.headline}{" "}
            <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
          </h1>

          <p className={styles.description}>{HERO_COPY.description}</p>

          <StoreBadges />
        </div>

        <div className={styles.phones}>
          <Image
            className={`${styles.phone} ${styles.phoneLeft}`}
            src={HERO_PHONES.left.src}
            alt={HERO_PHONES.left.alt}
            width={971}
            height={1619}
            sizes="(max-width: 1023px) 40vw, 22vw"
          />
          <Image
            className={`${styles.phone} ${styles.phoneRight}`}
            src={HERO_PHONES.right.src}
            alt={HERO_PHONES.right.alt}
            width={971}
            height={1619}
            sizes="(max-width: 1023px) 40vw, 22vw"
          />
          <Image
            className={`${styles.phone} ${styles.phoneCenter}`}
            src={HERO_PHONES.center.src}
            alt={HERO_PHONES.center.alt}
            width={971}
            height={1619}
            priority
            sizes="(max-width: 639px) 78vw, (max-width: 1023px) 46vw, 26vw"
          />
        </div>
      </div>
    </section>
  );
}
