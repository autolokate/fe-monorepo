import { ProblemSceneVisual } from '@/components/marketing/StoryCinematicVisual';
import { PROBLEM_COPY } from './constants';
import styles from './problem.module.css';

export function ProblemSection() {
  return (
    <section className={styles.section} aria-labelledby="problem-heading">
      <div className={styles.inner}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {PROBLEM_COPY.eyebrow}
          </p>

          <div className={styles.lines} id="problem-heading">
            {PROBLEM_COPY.lines.map((line) => (
              <p key={line} className={styles.line}>
                {line}
              </p>
            ))}
          </div>

          <p className={styles.pivot}>{PROBLEM_COPY.pivot}</p>
        </div>

        <ProblemSceneVisual priority />
      </div>
    </section>
  );
}
