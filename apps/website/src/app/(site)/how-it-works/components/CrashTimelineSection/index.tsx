import { CRASH_TIMELINE_COPY, CRASH_TIMELINE_STEPS } from './constants';
import styles from './index.module.css';

export function CrashTimelineSection() {
  const { eyebrow, headline, headlineAccent, subheadingLines, callout } = CRASH_TIMELINE_COPY;

  return (
    <section aria-labelledby="crash-timeline-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="crash-timeline-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>
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
            const { Icon } = step;
            const isLast = index === CRASH_TIMELINE_STEPS.length - 1;

            return (
              <li key={step.id} className={styles.step}>
                <div className={styles.marker}>
                  <span
                    className={`${styles.node} ${step.tone === 'warn' ? styles.nodeWarn : styles.nodeBrand}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                  </span>
                  {!isLast ? <span className={styles.connector} aria-hidden="true" /> : null}
                </div>

                <div className={`${styles.copy} ${isLast ? styles.copyLast : ''}`}>
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
