import { FLOW_STEPS } from './constants';
import styles from './experience-flow.module.css';

export function ExperienceFlow() {
  return (
    <section className={styles.section} aria-labelledby="flow-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            Connected experience
          </p>
          <h2 id="flow-heading" className={styles.headline}>
            From crash to care—one continuous system.
          </h2>
        </header>

        <ol className={styles.timeline}>
          {FLOW_STEPS.map((step, index) => (
            <li key={step.id} className={styles.step}>
              <div className={styles.rail} aria-hidden="true">
                <span className={styles.dot} />
                {index < FLOW_STEPS.length - 1 ? <span className={styles.line} /> : null}
              </div>
              <div className={styles.copy}>
                <h3 className={styles.label}>{step.label}</h3>
                <p className={styles.detail}>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
