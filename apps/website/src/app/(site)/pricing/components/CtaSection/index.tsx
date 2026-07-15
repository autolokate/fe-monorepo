import { CtaActions } from './CtaActions';
import { CTA_COPY } from './constants';
import styles from './index.module.css';

export function CtaSection() {
  return (
    <section className={styles.section} aria-labelledby="pricing-cta-heading">
      <div className={styles.container}>
        <div className={styles.banner}>
          <div className={styles.bg} aria-hidden="true">
            <div className={styles.bgImage} />
            <div className={styles.scrim} />
          </div>

          <div className={styles.content}>
            <h2 id="pricing-cta-heading" className={styles.headline}>
              {CTA_COPY.headline}
            </h2>
            <p className={styles.subheadline}>{CTA_COPY.subheadline}</p>

            <CtaActions />
          </div>
        </div>
      </div>
    </section>
  );
}
