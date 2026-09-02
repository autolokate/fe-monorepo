'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { JourneyHeader } from '../../../shared/components/JourneyHeader';
import { JourneyProgress } from '../../../shared/components/JourneyProgress';
import { JourneyError } from '../../../shared/components/JourneyError';
import { JOURNEY_ROUTES } from '../../../shared/routes';
import { patchJourneyState } from '../../../shared/storage';
import { usePlans } from '../../../shared/hooks/usePlans';
import { planTierRank } from '../../../shared/plans';
import type { Plan } from '../../../shared/services/plans-api';
import { PlanCard } from '../PlanCard';
import { PlansSkeleton } from '../PlansSkeleton';
import styles from './index.module.css';

const TRUST_ITEMS = [
  { src: '/purchase-journey/plans/trust-vahan.svg', label: 'Vahan verified' },
  { src: '/purchase-journey/plans/trust-secure.svg', label: 'Secure payment' },
  { src: '/purchase-journey/plans/trust-ships.svg', label: 'Ships free' },
];

export function PlansView() {
  const router = useRouter();
  const { plans, isLoading, isError, retry } = usePlans();

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => planTierRank(a.tier) - planTierRank(b.tier)),
    [plans],
  );

  const handleChoose = (plan: Plan) => {
    patchJourneyState({ planTier: plan.tier });
    router.push(JOURNEY_ROUTES.configure(plan.id));
  };

  return (
    <div className={styles.page}>
      <JourneyHeader />
      <JourneyProgress activeIndex={0} />

      {isError ? (
        <div className={styles.errorBody}>
          <JourneyError title="Couldn't load the plans" onRetry={retry} />
        </div>
      ) : (
        <div className={styles.body}>
          <Link href="/pricing" className={styles.backLink}>
            <ArrowLeft className={styles.backIcon} aria-hidden />
            Back
          </Link>

          <div className={styles.hd}>
            <h1 className={styles.title}>Choose your protection</h1>
            <p className={styles.subhead}>The cover that fits your driving</p>
          </div>

          {isLoading ? (
            <PlansSkeleton />
          ) : (
            <>
              <div className={styles.cards}>
                {sortedPlans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} onChoose={handleChoose} />
                ))}
              </div>

              <div className={styles.trust}>
                <div className={styles.trustStrip}>
                  {TRUST_ITEMS.map(({ src, label }) => (
                    <span key={label} className={styles.trustItem}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- static Figma-exported SVG glyph */}
                      <img
                        className={styles.trustIcon}
                        src={src}
                        alt=""
                        width={16}
                        height={16}
                        aria-hidden
                      />
                      {label}
                    </span>
                  ))}
                </div>
                <p className={styles.trustNote}>Works alongside 112, never replaces it</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
