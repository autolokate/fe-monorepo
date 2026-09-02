import { CRASH_TIMELINE_COPY, CRASH_TIMELINE_STEPS } from './constants';
import styles from './index.module.css';

export function CrashTimelineSection() {
  const { eyebrow, headline, headlineAccent, subheadingLines, callout } = CRASH_TIMELINE_COPY;

  return (
    <section
      aria-labelledby="crash-timeline-heading"
      className={`mkt-section mkt-lightBg ${styles.section}`}
    >
      <div className={`mkt-container ${styles.inner}`}>
        <header className={styles.header}>
          <p className="mkt-eyebrow">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="crash-timeline-heading" className={`mkt-headline ${styles.headline}`}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={`mkt-body ${styles.subheading}`}>
            {subheadingLines.map((line, index) => (
              <span key={line}>
                {line}
                {index < subheadingLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
        </header>

        <ol className={styles.timeline}>
          {CRASH_TIMELINE_STEPS.map((step, index) => {
            const isLast = index === CRASH_TIMELINE_STEPS.length - 1;

            return (
              <li
                key={step.id}
                className={`${styles.step} ${step.tone === 'warn' ? styles.stepWarn : ''}`}
              >
                <div className={styles.rail} aria-hidden="true">
                  <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                  {!isLast ? <span className={styles.connector} /> : null}
                </div>

                <div className={styles.copy}>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepBody}>{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p className={styles.callout}>{callout}</p>
      </div>
    </section>
  );
}
