import { Headphones } from 'lucide-react';
import { supportHighlights } from './constants';
import styles from './index.module.css';

export function SupportSection() {
  return (
    <section className={styles.section} aria-label="Support commitment">
      <div className={styles.inner}>
        <div className={styles.card}>
          <div className={styles.cardBg} aria-hidden="true">
            <div className={styles.cardBgImage} />
            <div className={styles.cardScrim} />
          </div>

          <div className={styles.cardContent}>
            <div className={styles.intro}>
              <span className={styles.introIcon} aria-hidden="true">
                <Headphones className="h-6 w-6" strokeWidth={1.75} />
              </span>
              <div>
                <h2 className={styles.introTitle}>We&apos;re here for you</h2>
                <p className={styles.introText}>
                  Our support team is ready to assist you with anything you need anytime.
                </p>
              </div>
            </div>

            <div className={styles.divider} aria-hidden="true" />

            <ul className={styles.highlights}>
              {supportHighlights.map(({ Icon, title, description }) => (
                <li key={title} className={styles.highlight}>
                  <span className={styles.highlightIcon} aria-hidden="true">
                    <Icon strokeWidth={2} />
                  </span>
                  <h3 className={styles.highlightTitle}>{title}</h3>
                  <p className={styles.highlightText}>{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
