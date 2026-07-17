/* eslint-disable @next/next/no-img-element -- decorative signal-rings SVG, no optimization benefit */
import { ClosingCta } from './ClosingCta';
import { CLOSING_CTA_COPY, CLOSING_SIGNAL_RINGS } from './constants';
import styles from './index.module.css';

export function ClosingCtaSection() {
  const { headline, headlineAccent, subheading } = CLOSING_CTA_COPY;

  return (
    <section aria-labelledby="about-closing-cta-heading" className={styles.section}>
      <img src={CLOSING_SIGNAL_RINGS} alt="" aria-hidden="true" className={styles.rings} />

      <div className={styles.inner}>
        <div className={styles.headingStack}>
          <h2 id="about-closing-cta-heading" className={styles.headline}>
            {headline} <span className={styles.headlineAccent}>{headlineAccent}</span>
          </h2>
          <p className={styles.subheading}>{subheading}</p>
        </div>

        <ClosingCta />
      </div>
    </section>
  );
}
