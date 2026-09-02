import { SmartQrSectionContent } from './SmartQrSectionContent';
import styles from './index.module.css';

export function SmartQrSection() {
  return (
    <section aria-labelledby="smart-qr-heading" className={`mkt-section ${styles.section}`}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={`mkt-container ${styles.inner}`}>
        <SmartQrSectionContent />
      </div>
    </section>
  );
}
