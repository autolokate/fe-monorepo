import { Check } from 'lucide-react';
import { SAFETY_PACKS_COPY } from '@/app/home/components/SafetyPacksSection/constants';
import { PlanCarousel } from '@/app/home/components/SafetyPacksSection/PlanCarousel';
import styles from './index.module.css';

export function PricingPlansSection() {
  return (
    <section className={styles.section} aria-labelledby="pricing-plans-heading">
      <div className={styles.container}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{SAFETY_PACKS_COPY.eyebrow}</span>
          <h2 id="pricing-plans-heading" className={styles.title}>
            {SAFETY_PACKS_COPY.headline}
          </h2>
          <p className={styles.subtitle}>{SAFETY_PACKS_COPY.subheading}</p>
        </header>

        <PlanCarousel />

        <ul className={styles.footnotes}>
          {SAFETY_PACKS_COPY.footnotes.map((note) => (
            <li key={note} className={styles.footnote}>
              <span className={styles.footnoteIcon} aria-hidden>
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              </span>
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
