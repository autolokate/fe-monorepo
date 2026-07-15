import { Check } from 'lucide-react';
import { ChooseComboButton } from './ChooseComboButton';
import { COVERAGE_COPY, PLAN_INCLUDES } from './constants';
import styles from './index.module.css';

export function CoveragePlansSection() {
  return (
    <section className={styles.section} aria-labelledby="coverage-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{COVERAGE_COPY.eyebrow}</span>
          <h2 id="coverage-heading" className={styles.title}>
            {COVERAGE_COPY.title}
          </h2>
        </header>

        <div className={styles.card}>
          <div className={styles.cardMedia}>
            <div className={styles.cardCopy}>
              <h3 className={styles.cardTitle}>{COVERAGE_COPY.card.title}</h3>
              <p className={styles.cardSubtitle}>{COVERAGE_COPY.card.subtitle}</p>
            </div>
          </div>

          <div className={styles.cardPlan}>
            <p className={styles.planTitle}>{COVERAGE_COPY.card.planTitle}</p>
            <ul className={styles.planList}>
              {PLAN_INCLUDES.map((item) => (
                <li key={item} className={styles.planItem}>
                  <span className={styles.planCheck} aria-hidden>
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className={styles.planNote}>{COVERAGE_COPY.card.note}</p>
          </div>
        </div>

        <div className={styles.combo}>
          <div className={styles.comboInfo}>
            <p className={styles.comboTitle}>
              {COVERAGE_COPY.combo.title}{' '}
              <span className={styles.comboTag}>{COVERAGE_COPY.combo.tag}</span>
            </p>
            <p className={styles.comboDesc}>{COVERAGE_COPY.combo.description}</p>
          </div>
          <div className={styles.comboCta}>
            <ChooseComboButton />
          </div>
        </div>
      </div>
    </section>
  );
}
