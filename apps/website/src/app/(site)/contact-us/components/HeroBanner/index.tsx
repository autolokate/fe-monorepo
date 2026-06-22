import { Sparkles } from "lucide-react";
import { heroMeta } from "./constants";
import styles from "./index.module.css";

export function HeroBanner() {
  return (
    <section className={styles.hero} aria-labelledby="contact-hero-heading">
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.bgImage} />
        <div className={styles.bgGradient} />
        <div className={styles.fadeBottom} />
      </div>

      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.badge}>
            <Sparkles className="h-3 w-3" aria-hidden />
            24/7 Support Center
          </span>

          <h1 id="contact-hero-heading" className={styles.headline}>
            Let&apos;s connect. We&apos;re here to help.
          </h1>

          <p className={styles.description}>
            Whether you need support, have a question, or want to share feedback we&apos;re just
            a message away.
          </p>

          <ul className={styles.metaList} aria-label="Support highlights">
            {heroMeta.map(({ label, value, Icon }) => (
              <li key={label} className={styles.metaItem}>
                <span className={styles.metaIcon} aria-hidden="true">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className={styles.metaText}>
                  <span className={styles.metaLabel}>{label}</span>
                  <span className={styles.metaValue}>{value}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
