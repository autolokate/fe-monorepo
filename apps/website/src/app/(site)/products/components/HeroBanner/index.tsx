import { HERO_COPY, HERO_HIGHLIGHTS } from "./constants";
import styles from "./index.module.css";

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-label="Partner with the Autolokate network">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.scrim} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <h1 className={styles.headline}>
            {HERO_COPY.headline}
            <span className={styles.headlineLine}>
              <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
            </span>
          </h1>

          <p className={styles.description}>{HERO_COPY.description}</p>

          <ul className={styles.highlights}>
            {HERO_HIGHLIGHTS.map(({ id, title, description, Icon }) => (
              <li key={id} className={styles.highlight}>
                <span className={styles.highlightIcon} aria-hidden>
                  <Icon className="h-4 w-4 stroke-[1.9]" />
                </span>
                <div className={styles.highlightCopy}>
                  <span className={styles.highlightTitle}>{title}</span>
                  <span className={styles.highlightDescription}>{description}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
