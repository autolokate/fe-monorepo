import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PlanCta } from './PlanCta';
import { PLANS_COPY, PLAN_CARDS } from './constants';
import styles from './index.module.css';

export function PricingPlansSection() {
  return (
    <section className={styles.section} aria-labelledby="pricing-plans-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDash} aria-hidden="true" />
            {PLANS_COPY.eyebrow}
          </p>

          <h2 id="pricing-plans-heading" className={styles.headline}>
            {PLANS_COPY.headline}{' '}
            <span className={styles.headlineAccent}>{PLANS_COPY.headlineAccent}</span>
          </h2>

          <p className={styles.subheading}>{PLANS_COPY.subheading}</p>
        </header>

        <ul className={styles.grid}>
          {PLAN_CARDS.map((plan) => {
            const { Icon } = plan;
            return (
              <li
                key={plan.id}
                className={`${styles.card} ${plan.popular ? styles.cardPopular : ''}`}
              >
                {plan.badge ? (
                  <span className={styles.badge}>
                    <span className={styles.badgeDot} aria-hidden="true" />
                    {plan.badge}
                  </span>
                ) : null}

                <div className={styles.cardHead}>
                  <span className={styles.iconBadge} aria-hidden="true">
                    <Icon className="h-6 w-6" strokeWidth={1.9} />
                  </span>
                  <h3 className={styles.cardName}>{plan.name}</h3>
                </div>

                <div className={styles.priceRow}>
                  <span className={styles.price}>{plan.price}</span>
                  <span className={styles.unit}>{plan.unit}</span>
                </div>

                <p className={styles.note}>{plan.note}</p>

                <p className={styles.description}>{plan.description}</p>

                <PlanCta label={plan.ctaLabel} href={plan.ctaHref} popular={plan.popular} />

                <Link href={plan.detailsHref} className={styles.detailsLink}>
                  <span className={styles.detailsText}>{plan.detailsLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>

        <p className={styles.footnote}>{PLANS_COPY.footnote}</p>
      </div>
    </section>
  );
}
