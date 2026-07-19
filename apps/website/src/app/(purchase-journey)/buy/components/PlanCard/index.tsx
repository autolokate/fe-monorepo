'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Plan } from '../../../shared/services/plans-api';
import { formatRupees, getPlanVisual } from '../../../shared/plans';
import styles from './index.module.css';

interface PlanCardProps {
  plan: Plan;
  /** Fired when the buyer chooses this plan. */
  onChoose: (plan: Plan) => void;
  /** Where the "See what's included" link points. */
  detailsHref?: string;
}

const CHECK_SRC = '/purchase-journey/plans/check.svg';
const CHECK_HERO_SRC = '/purchase-journey/plans/check-hero.svg';

export function PlanCard({ plan, onChoose, detailsHref = '/pricing' }: PlanCardProps) {
  const { variant, iconSrc } = getPlanVisual(plan.tier);
  const hero = variant === 'hero';
  const checkSrc = hero ? CHECK_HERO_SRC : CHECK_SRC;

  return (
    <article className={cn(styles.card, hero && styles.cardHero)}>
      {plan.badge ? (
        <span className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden />
          {plan.badge}
        </span>
      ) : null}

      <header className={styles.head}>
        <span className={styles.iconTile}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static Figma-exported SVG glyph */}
          <img className={styles.icon} src={iconSrc} alt="" width={24} height={24} aria-hidden />
        </span>
        <h3 className={styles.title}>{plan.name}</h3>
      </header>

      <div className={styles.priceRow}>
        <span className={styles.price}>{formatRupees(plan.pricePaise)}</span>
        <span className={styles.priceUnit}>/year per vehicle</span>
      </div>
      <p className={styles.fineNote}>GST included · no hidden charges</p>

      <ul className={styles.features}>
        {plan.features.map((feature) => (
          <li key={feature} className={styles.feature}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static Figma-exported SVG glyph */}
            <img
              className={styles.check}
              src={checkSrc}
              alt=""
              width={16}
              height={16}
              aria-hidden
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={cn(styles.cta, hero ? styles.ctaPrimary : styles.ctaSecondary)}
        onClick={() => {
          onChoose(plan);
        }}
      >
        Choose {plan.name}
      </button>

      <Link href={detailsHref} className={styles.detailsLink}>
        <span className={styles.detailsText}>See what&apos;s included in {plan.name}</span>
        <span aria-hidden> →</span>
      </Link>
    </article>
  );
}
