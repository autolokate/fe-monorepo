import Link from 'next/link';
import { ArrowRight, Check } from 'lucide-react';
import type { SafetyPlan } from '../SafetyPacksSection/types';
import styles from './protection.module.css';

interface ProtectionPlanCardProps {
  plan: SafetyPlan;
  highlights: readonly string[];
  onChoose: () => void;
}

export function ProtectionPlanCard({ plan, highlights, onChoose }: ProtectionPlanCardProps) {
  const { tierLabel, Icon, price, pricePeriod, popular, popularBadge, summary, ctaLabel, variant } =
    plan;

  return (
    <li
      className={`${styles.card} ${popular ? styles.cardFeatured : ''} ${styles[`card${variant.charAt(0).toUpperCase()}${variant.slice(1)}`]}`}
    >
      {popular ? (
        <span className={styles.popularBadge}>
          <span className={styles.popularDot} aria-hidden="true" />
          {popularBadge ?? 'Most popular'}
        </span>
      ) : null}

      <div className={styles.cardIntro}>
        <div className={styles.cardHead}>
          <span className={styles.tierIcon} aria-hidden="true">
            <Icon className="h-6 w-6" strokeWidth={1.7} />
          </span>
          <div className={styles.tierMeta}>
            <h3 className={styles.tierName}>{tierLabel}</h3>
            {summary ? <p className={styles.tierSummary}>{summary}</p> : null}
          </div>
        </div>

        <p className={styles.tierPrice}>
          <span className={styles.price}>{price}</span>
          <span className={styles.period}>
            {pricePeriod} <span className={styles.perVehicle}>per vehicle</span>
          </span>
        </p>
        <p className={styles.gstNote}>GST included. No hidden charges.</p>
      </div>

      <ul className={styles.highlights}>
        {highlights.map((item) => (
          <li key={item} className={styles.highlight}>
            <Check className={styles.checkIcon} strokeWidth={2.5} aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className={styles.cardActions}>
        <button type="button" className={styles.chooseBtn} onClick={onChoose}>
          {ctaLabel}
        </button>

        <Link href="/pricing" className={styles.detailsLink}>
          See what&rsquo;s included
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </li>
  );
}
