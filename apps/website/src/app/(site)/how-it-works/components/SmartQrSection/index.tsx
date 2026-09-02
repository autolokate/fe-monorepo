import Image from 'next/image';
import { QR_BRANCH_STEPS, QR_SCAN_STEP, QR_STICKER_IMAGE, SMART_QR_COPY } from './constants';
import styles from './index.module.css';

export function SmartQrSection() {
  const { eyebrow, headline, headlineAccent, subheading, callout } = SMART_QR_COPY;

  return (
    <section
      aria-labelledby="smart-qr-heading"
      className={`mkt-section mkt-lightBg ${styles.section}`}
    >
      <div className={`mkt-container ${styles.inner}`}>
        <div className={`mkt-split mkt-splitWide ${styles.split}`}>
          <div className={styles.stickerCol}>
            <Image
              src={QR_STICKER_IMAGE}
              alt="Autolokate Smart QR emergency sticker"
              width={344}
              height={424}
              className={styles.sticker}
            />
          </div>

          <div className={styles.story}>
            <header className={styles.header}>
              <p className="mkt-eyebrow">
                <span className="mkt-eyebrowLine" aria-hidden="true" />
                {eyebrow}
              </p>

              <h2 id="smart-qr-heading" className={`mkt-headline ${styles.headline}`}>
                {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
              </h2>

              <p className={`mkt-body ${styles.subheading}`}>{subheading}</p>
            </header>

            <ol className={styles.journey}>
              <li className={styles.journeyStep}>
                <span className={styles.stepLabel}>01</span>
                <div className={styles.stepCopy}>
                  <h3 className={styles.itemTitle}>{QR_SCAN_STEP.title}</h3>
                  <p className={styles.itemBody}>{QR_SCAN_STEP.body}</p>
                </div>
              </li>

              {QR_BRANCH_STEPS.map((step, index) => (
                <li key={step.id} className={styles.journeyStep}>
                  <span className={styles.stepLabel}>{String(index + 2).padStart(2, '0')}</span>
                  <div className={styles.stepCopy}>
                    <h3 className={styles.itemTitle}>{step.title}</h3>
                    <p className={styles.itemBody}>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <p className={styles.callout}>{callout}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
