import Image from 'next/image';
import { QR_BRANCH_STEPS, QR_SCAN_STEP, QR_STICKER_IMAGE, SMART_QR_COPY } from './constants';
import styles from './index.module.css';

export function SmartQrSection() {
  const { eyebrow, headline, headlineAccent, subheading, callout } = SMART_QR_COPY;
  const { Icon: ScanIcon } = QR_SCAN_STEP;

  return (
    <section aria-labelledby="smart-qr-heading" className={styles.section}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="smart-qr-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{subheading}</p>
        </header>

        <div className={styles.journey}>
          <div className={styles.stickerWrap}>
            <Image
              src={QR_STICKER_IMAGE}
              alt="Autolokate Smart QR emergency sticker"
              width={344}
              height={424}
              className={styles.sticker}
            />
          </div>

          <div className={styles.chain}>
            <div className={`${styles.item} ${styles.scan}`}>
              <span className={styles.node} aria-hidden="true">
                <ScanIcon className="h-[22px] w-[22px]" strokeWidth={1.9} />
              </span>
              <div className={styles.itemCopy}>
                <h3 className={styles.itemTitle}>{QR_SCAN_STEP.title}</h3>
                <p className={styles.itemBody}>{QR_SCAN_STEP.body}</p>
              </div>
            </div>

            <svg
              className={styles.bracket}
              viewBox="0 0 72 252"
              fill="none"
              aria-hidden="true"
              preserveAspectRatio="none"
            >
              <path
                d="M0 126 H36 M36 53 V199 M36 53 H72 M36 199 H72"
                stroke="#C4C4C4"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            <div className={styles.branches}>
              {QR_BRANCH_STEPS.map((step) => {
                const { Icon } = step;
                return (
                  <div key={step.id} className={styles.item}>
                    <span className={styles.node} aria-hidden="true">
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.9} />
                    </span>
                    <div className={styles.itemCopy}>
                      <h3 className={styles.itemTitle}>{step.title}</h3>
                      <p className={styles.itemBody}>{step.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className={styles.callout}>{callout}</p>
      </div>
    </section>
  );
}
