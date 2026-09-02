import { SAFE_STARTER_COPY } from './constants';
import { SafeStartVisual } from './SafeStartVisual';
import styles from './index.module.css';

export function SafeStarterSection() {
  const {
    eyebrow,
    headlineLead,
    headlineAccent,
    headlineRest,
    description,
    availability,
    upgrade,
  } = SAFE_STARTER_COPY;

  return (
    <section
      aria-labelledby="safe-starter-heading"
      className={`mkt-section mkt-mutedBg ${styles.section}`}
    >
      <div className={`mkt-container ${styles.inner}`}>
        <div className={styles.visual}>
          <SafeStartVisual />
        </div>

        <div className={styles.copy}>
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="safe-starter-heading" className={`mkt-headline ${styles.headline}`}>
            {headlineLead} <span className={styles.headlineAccent}>{headlineAccent}</span>{' '}
            {headlineRest}
          </h2>

          <p className={styles.description}>{description}</p>
          <p className={styles.availability}>{availability}</p>
          <p className={styles.upgrade}>{upgrade}</p>
        </div>
      </div>
    </section>
  );
}
