import Image from 'next/image';
import { Phone } from 'lucide-react';
import { QrCta } from './QrCta';
import { QR_FEATURES, QR_SECTION_COPY, QR_STICKER_IMAGE } from './constants';
import styles from './index.module.css';

export function QrSection() {
  const { eyebrow, headline, headlineAccent, body, chip } = QR_SECTION_COPY;

  return (
    <section aria-labelledby="qr-heading" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.scene}>
          <div className={styles.stickerWrap}>
            <Image
              src={QR_STICKER_IMAGE}
              alt="Autolokate Smart QR emergency sticker"
              width={321}
              height={397}
              className={styles.sticker}
            />
          </div>

          <div className={styles.chip}>
            <span className={styles.chipIcon} aria-hidden="true">
              <Phone className="h-[17px] w-[17px]" strokeWidth={2} />
            </span>
            <span className={styles.chipText}>
              <span className={styles.chipTitle}>{chip.title}</span>
              <span className={styles.chipSubtitle}>{chip.subtitle}</span>
            </span>
          </div>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {eyebrow}
          </p>

          <h2 id="qr-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>

          <p className={styles.body}>{body}</p>

          <div className={styles.features}>
            {QR_FEATURES.map((feature) => {
              const { Icon } = feature;
              return (
                <div key={feature.id} className={styles.feature}>
                  <span
                    className={`${styles.featureIcon} ${feature.tone === 'emergency' ? styles.featureIconEmergency : styles.featureIconBrand}`}
                    aria-hidden="true"
                  >
                    <Icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <div className={styles.featureText}>
                    <p className={styles.featureTitle}>{feature.title}</p>
                    <p className={styles.featureBody}>{feature.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.ctaRow}>
            <QrCta />
          </div>
        </div>
      </div>
    </section>
  );
}
