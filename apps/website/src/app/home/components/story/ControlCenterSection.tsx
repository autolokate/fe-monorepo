import { ControlCenterFlowTimeline } from './ControlCenterFlowTimeline';
import { ControlCenterPhoneStage } from './ControlCenterPhoneStage';
import { CONTROL_CENTER_COPY } from './constants';
import styles from './control-center.module.css';

function LiveResponseBadge() {
  return (
    <div className={styles.liveBadge}>
      <span className={styles.liveDot} aria-hidden="true" />
      <div className={styles.liveCopy}>
        <p className={styles.liveTitle}>Live Response</p>
        <p className={styles.liveBody}>Your incident is managed 24/7 by our operations team.</p>
      </div>
    </div>
  );
}

export function ControlCenterSection() {
  const { eyebrow, headline, headlineAccent, body } = CONTROL_CENTER_COPY;

  return (
    <section className={styles.section} aria-labelledby="control-center-heading">
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.visual}>
          <ControlCenterPhoneStage />
        </div>

        <div className={styles.content}>
          <header className={styles.copy}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 id="control-center-heading" className={styles.headline}>
              {headline}
              <br />
              <span className={styles.accent}>{headlineAccent}</span>
            </h2>
            <p className={styles.body}>{body}</p>
          </header>

          <LiveResponseBadge />
          <ControlCenterFlowTimeline />
        </div>
      </div>
    </section>
  );
}
