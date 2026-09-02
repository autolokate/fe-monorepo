import { CrashTimelineFlow } from './CrashTimelineFlow';
import { CRASH_TIMELINE_COPY } from './constants';
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

        <CrashTimelineFlow />

        <p className={styles.callout}>
          <span className={styles.calloutIcon} aria-hidden="true" />
          {callout}
        </p>
      </div>
    </section>
  );
}
