import { ShieldCheck } from 'lucide-react';
import { INSURANCE_COPY, INSURANCE_FEATURES } from './constants';
import styles from './index.module.css';

export function InsuranceCoverSection() {
  return (
    <section className={styles.section} aria-labelledby="insurance-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{INSURANCE_COPY.eyebrow}</span>
          <h2 id="insurance-heading" className={styles.title}>
            {INSURANCE_COPY.title}
          </h2>
        </header>

        <div className={styles.grid}>
          {INSURANCE_FEATURES.map(({ id, title, description, Icon, items }) => (
            <div key={id} className={styles.feature}>
              <span className={styles.featureIcon} aria-hidden>
                <Icon className="h-6 w-6 stroke-[1.8]" />
              </span>
              <div className={styles.featureBody}>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{description}</p>
                <ul className={styles.list}>
                  {items.map((item) => (
                    <li key={item} className={styles.item}>
                      <span className={styles.bullet} aria-hidden>
                        ▸
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

          <aside className={styles.accent}>
            <span className={styles.accentIcon} aria-hidden>
              <ShieldCheck className="h-7 w-7 stroke-[1.7]" />
            </span>
            <p className={styles.accentText}>
              {INSURANCE_COPY.accent.line1}
              <br />
              {INSURANCE_COPY.accent.line2}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
