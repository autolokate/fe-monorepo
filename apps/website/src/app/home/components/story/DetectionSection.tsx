import { DetectionPhoneStage } from './DetectionPhoneStage';
import { DETECTION_COPY } from './constants';
import styles from './detection.module.css';

export function DetectionSection() {
  const { eyebrow, headline, headlineLine2, body, detail } = DETECTION_COPY;

  return (
    <section className={styles.section} aria-labelledby="detection-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowLine} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 id="detection-heading" className={styles.headline}>
            {headline}
            <br />
            {headlineLine2}
          </h2>
          <p className={styles.body}>{body}</p>
          <p className={styles.detail}>{detail}</p>
        </div>

        <div className={styles.visual}>
          <DetectionPhoneStage priority />
        </div>
      </div>
    </section>
  );
}
