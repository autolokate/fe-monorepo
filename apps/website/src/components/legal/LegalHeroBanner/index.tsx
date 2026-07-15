import type { LegalHeroBannerCopy } from './types';
import styles from './index.module.css';

export function LegalHeroBanner({
  badgeLabel,
  BadgeIcon,
  title,
  description,
  meta,
}: LegalHeroBannerCopy) {
  return (
    <section className={styles.hero} aria-labelledby="legal-hero-heading">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgGradient} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.badge}>
            <BadgeIcon className="h-3 w-3" aria-hidden />
            {badgeLabel}
          </span>

          <h1 id="legal-hero-heading" className={styles.headline}>
            {title}
          </h1>

          <p className={styles.description}>{description}</p>

          <ul className={styles.metaList} aria-label="Document details">
            {meta.map(({ label, value, Icon }) => (
              <li key={label} className={styles.metaItem}>
                <span className={styles.metaIcon} aria-hidden="true">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className={styles.metaText}>
                  <span className={styles.metaLabel}>{label}</span>
                  <span className={styles.metaValue}>{value}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
