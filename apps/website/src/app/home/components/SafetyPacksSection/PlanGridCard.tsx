import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AlButton } from '@autolokate/ui/button';
import type { SafetyPlan } from './types';
import styles from './grid.module.css';

interface PlanGridCardProps {
  plan: SafetyPlan;
  onChoose?: () => void;
}

export function PlanGridCard({ plan, onChoose }: PlanGridCardProps) {
  const { tierLabel, Icon, price, pricePeriod, popular, popularBadge, summary, ctaLabel } = plan;

  return (
    <article className={`${styles.card} ${popular ? styles.cardPopular : ''}`}>
      {popular ? (
        <span className={styles.popularPill}>
          <span className={styles.popularDot} aria-hidden="true" />
          {popularBadge ?? 'Most popular'}
        </span>
      ) : null}

      <div className={styles.head}>
        <span className={styles.tierBadge} aria-hidden="true">
          <Icon className="h-6 w-6" strokeWidth={1.7} />
        </span>
        <p className={styles.tierName}>{tierLabel}</p>
      </div>

      <p className={styles.priceRow}>
        <span className={styles.price}>{price}</span>
        <span className={styles.pricePeriod}>{pricePeriod} per vehicle</span>
      </p>
      <p className={styles.gst}>GST included. No hidden charges.</p>

      {summary ? <p className={styles.summary}>{summary}</p> : null}

      <AlButton
        size="md"
        radius="lg"
        variant={popular ? 'primary' : 'outline'}
        className={`${styles.cta} ${popular ? styles.ctaPopular : styles.ctaDefault}`}
        onClick={onChoose}
      >
        {ctaLabel}
      </AlButton>

      <Link className={styles.includedLink} href="/pricing">
        See what&rsquo;s included in {tierLabel}
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </article>
  );
}
