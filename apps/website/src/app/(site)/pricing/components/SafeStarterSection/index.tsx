import Image from 'next/image';
import { SAFE_STARTER_COPY, STARTER_STICKER_IMAGE } from './constants';
import styles from './index.module.css';

export function SafeStarterSection() {
  const {
    eyebrow,
    headlineLead,
    headlineAccent,
    headlineRest,
    description,
    availability,
    upgrade,
  } = SAFE_STARTER_COPY;

  return (
    <section aria-labelledby="safe-starter-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.stickerWrap}>
          <Image
            src={STARTER_STICKER_IMAGE}
            alt="Autolokate ₹99 Safe Smart QR starter sticker"
            width={344}
            height={424}
            className={styles.sticker}
          />
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="safe-starter-heading" className={styles.headline}>
            {headlineLead} <span className={styles.headlineAccent}>{headlineAccent}</span>{' '}
            {headlineRest}
          </h2>

          <p className={styles.description}>{description}</p>
          <p className={styles.availability}>{availability}</p>
          <p className={styles.upgrade}>{upgrade}</p>
        </div>
      </div>
    </section>
  );
}
