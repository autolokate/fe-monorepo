import { GetStartedCta } from './GetStartedCta';
import { GETTING_STARTED_COPY, GETTING_STARTED_STEPS } from './constants';
import styles from './index.module.css';

export function GettingStartedSection() {
  const { eyebrow, headline, headlineAccent, headlineSuffix, subheadline } = GETTING_STARTED_COPY;

  return (
    <section aria-labelledby="getting-started-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="getting-started-heading" className={styles.headline}>
            {headline}
            <span className={styles.headlineAccent}>{headlineAccent}</span>
            {headlineSuffix}
          </h2>
          <p className={styles.subheadline}>{subheadline}</p>
        </header>

        <ol className={styles.journey}>
          <svg
            className={styles.wave}
            viewBox="0 0 1200 112"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M150 76 C300 76 300 36 450 36 C600 36 600 76 750 76 C900 76 900 36 1050 36"
              fill="none"
              stroke="#c9cdd3"
              strokeWidth="2"
              strokeDasharray="2 7"
              strokeLinecap="round"
            />
          </svg>
          {GETTING_STARTED_STEPS.map((step, index) => {
            const { Icon } = step;
            const markerRaised = index % 2 === 1;
            return (
              <li key={step.id} className={styles.step}>
                <div
                  className={`${styles.stepMarker} ${markerRaised ? styles.stepMarkerRaised : ''}`}
                >
                  <span
                    className={`${styles.stepBadge} ${step.highlight ? styles.stepBadgeHighlight : ''}`}
                  >
                    <Icon className={styles.stepIcon} strokeWidth={1.7} aria-hidden />
                  </span>
                </div>
                {index < GETTING_STARTED_STEPS.length - 1 ? (
                  <span className={styles.connector} aria-hidden="true" />
                ) : null}
                <p className={styles.stepTitle}>{step.title}</p>
                <p className={styles.stepBody}>{step.body}</p>
              </li>
            );
          })}
        </ol>

        <div className={styles.ctaRow}>
          <GetStartedCta />
        </div>
      </div>
    </section>
  );
}
