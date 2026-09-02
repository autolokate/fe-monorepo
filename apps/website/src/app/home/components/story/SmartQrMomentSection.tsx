import { SmartQrEcosystemVisual } from '@/components/marketing/StoryCinematicVisual';
import { QrFlowStrip } from '../capabilities/QrFlowStrip';
import { SMART_QR_COPY } from './constants';
import styles from './smart-qr.module.css';

function SecureBadge() {
  return (
    <div className={styles.secure}>
      <span className={styles.secureIcon} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className={styles.secureSvg}>
          <path
            d="M12 3 5 6v5c0 4.2 3 8.1 7 9 4-0.9 7-4.8 7-9V6l-7-3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="m9 12 2 2 4-4"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className={styles.secureCopy}>
        <p className={styles.secureTitle}>{SMART_QR_COPY.secureTitle}</p>
        <p className={styles.secureBody}>{SMART_QR_COPY.secureBody}</p>
      </div>
    </div>
  );
}

export function SmartQrMomentSection() {
  const { eyebrow, headline, headlineAccent, body } = SMART_QR_COPY;

  return (
    <section className={styles.section} aria-labelledby="smart-qr-heading">
      <div className={styles.ambient} aria-hidden="true" />

      <div className={styles.inner}>
        <div className={styles.content}>
          <header className={styles.copy}>
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowLine} aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 id="smart-qr-heading" className={styles.headline}>
              {headline} <span className={styles.accent}>{headlineAccent}</span>
            </h2>
            <p className={styles.body}>{body}</p>
          </header>

          <SecureBadge />
          <QrFlowStrip />
        </div>

        <div className={styles.visual}>
          <div className={styles.phoneGlow} aria-hidden="true" />
          <div className={styles.phoneFrame}>
            <SmartQrEcosystemVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
