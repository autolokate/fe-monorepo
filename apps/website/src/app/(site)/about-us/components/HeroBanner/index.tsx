import { ABOUT_HERO_COPY, ABOUT_HERO_FEATURES, ABOUT_HERO_STATS } from './constants';
import { HeroCta } from './HeroCta';
import styles from './index.module.css';

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="about-hero-heading">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgGradient} />
        <div className={styles.fadeTop} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.mainRow}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>{ABOUT_HERO_COPY.eyebrow}</span>

            <h1 id="about-hero-heading" className={styles.headline}>
              {ABOUT_HERO_COPY.headline}{' '}
              <span className={styles.headlineAccent}>{ABOUT_HERO_COPY.headlineAccent}</span>
            </h1>

            <p className={styles.subheading}>{ABOUT_HERO_COPY.subheading}</p>

            <HeroCta />
          </div>

          <ul className={styles.features} aria-label="Platform capabilities">
            {ABOUT_HERO_FEATURES.map(({ title, body, Icon }) => (
              <li key={title} className={styles.feature}>
                <span className={styles.featureIcon} aria-hidden>
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className={styles.featureTitle}>{title}</p>
                  <p className={styles.featureBody}>{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.statsBar}>
          <ul className={styles.statsList}>
            {ABOUT_HERO_STATS.map(({ value, label, Icon }) => (
              <li key={label} className={styles.stat}>
                <span className={styles.statIcon} aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className={styles.statValue}>{value}</p>
                  <p className={styles.statLabel}>{label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
