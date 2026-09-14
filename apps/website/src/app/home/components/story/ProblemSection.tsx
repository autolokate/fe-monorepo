import { ProblemSceneVisual } from '@/components/marketing/StoryCinematicVisual';
import { PROBLEM_COPY } from './constants';
import styles from './problem.module.css';

export function ProblemSection() {
  const [headline, ...points] = PROBLEM_COPY.lines;

  return (
    <section className={styles.section} aria-labelledby="problem-heading">
      <div className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.headerBlock}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              {PROBLEM_COPY.eyebrow}
            </p>
            <h2 id="problem-heading" className={styles.headline}>
              {headline}
            </h2>
          </div>

          <ul className={styles.pointsList}>
            {points.map((point) => (
              <li key={point} className={styles.pointItem}>
                <span className={styles.pointBullet} aria-hidden="true" />
                <span className={styles.pointText}>{point}</span>
              </li>
            ))}
          </ul>

          <div className={styles.pivotCard}>
            <p className={styles.pivot}>{PROBLEM_COPY.pivot}</p>
          </div>
        </div>

        <div className={styles.visualWrap}>
          <ProblemSceneVisual priority />
        </div>
      </div>
    </section>
  );
}
