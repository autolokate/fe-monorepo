import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import { PlanCta } from './PlanCta';
import { PLANS_COPY, PLAN_CARDS } from './constants';
import styles from './index.module.css';

export function PricingPlansSection() {
  return (
    <section className={styles.section} aria-labelledby="pricing-plans-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className="mkt-eyebrow mkt-eyebrowLeft">
            <span className="mkt-eyebrowLine" aria-hidden="true" />
            {PLANS_COPY.eyebrow}
          </p>

          <h2 id="pricing-plans-heading" className="mkt-headline">
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
                  <span className={styles.popularPill}>
                    <span className={styles.popularDot} aria-hidden="true" />
                    {plan.badge}
                  </span>
                ) : null}

                <div className={styles.planIntro}>
                  <div className={styles.head}>
                    <span className={styles.tierBadge} aria-hidden="true">
                      <Icon className="h-6 w-6" strokeWidth={1.7} />
                    </span>
                    <div className={styles.nameGroup}>
                      <h3 className={styles.levelName}>{plan.name}</h3>
                      <p className={styles.tagline}>{plan.tagline}</p>
                    </div>
                  </div>

                  <div className={styles.priceRow}>
                    <span className={styles.price}>{plan.price}</span>
                    <span className={styles.unit}>{plan.unit}</span>
                  </div>
                  <p className={styles.note}>{plan.note}</p>
                </div>

                <div className={styles.protectBlock}>
                  <p className={styles.protectLabel}>What this protects</p>
                  <p className={styles.description}>{plan.description}</p>
                  <ul className={styles.highlights}>
                    {plan.highlights.map((item) => (
                      <li key={item} className={styles.highlight}>
                        <Check className={styles.checkIcon} strokeWidth={2.5} aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.actions}>
                  <PlanCta label={plan.ctaLabel} href={plan.ctaHref} popular={plan.popular} />

                  <Link href={plan.detailsHref} className={styles.detailsLink}>
                    {plan.detailsLabel}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>

        <p className={styles.footnote}>{PLANS_COPY.footnote}</p>
      </div>
    </section>
  );
}
