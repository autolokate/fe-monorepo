import { CTA_COPY, CTA_TRUST } from "./constants";
import { CtaActions } from "./CtaActions";
import styles from "./index.module.css";

export function CtaSection() {
  return (
    <section className={styles.section} aria-labelledby="features-cta-heading">
      <div className={styles.container}>
        <div className={styles.banner}>
          <div className={styles.bg} aria-hidden="true">
            <div className={styles.bgImage} />
            <div className={styles.scrim} />
          </div>

          <div className={styles.content}>
            <h2 id="features-cta-heading" className={styles.headline}>
              {CTA_COPY.headline}
            </h2>
            <p className={styles.subheadline}>{CTA_COPY.subheadline}</p>

            <CtaActions />

            <ul className={styles.trust}>
              {CTA_TRUST.map(({ id, label, Icon, flag }) => (
                <li key={id} className={styles.trustItem}>
                  <span className={styles.trustIcon} aria-hidden="true">
                    {flag ? (
                      <span className={styles.flag}>🇮🇳</span>
                    ) : Icon ? (
                      <Icon className="h-4 w-4" />
                    ) : null}
                  </span>
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
