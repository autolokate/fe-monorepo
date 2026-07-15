import { HERO_COPY, HERO_FEATURES } from './constants';
import styles from './index.module.css';

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-label="Autolokate emergency and safety overview">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.scrim} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>{HERO_COPY.eyebrow}</span>

          <h1 className={styles.headline}>
            {HERO_COPY.headline}
            <span className={styles.headlineAccent}>{HERO_COPY.headlineAccent}</span>
          </h1>

          <p className={styles.description}>{HERO_COPY.description}</p>

          <ul className={styles.features}>
            {HERO_FEATURES.map(({ id, label, Icon }) => (
              <li key={id} className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden>
                  <Icon className="h-4 w-4 stroke-[1.9]" />
                </span>
                <span className={styles.featureLabel}>{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
