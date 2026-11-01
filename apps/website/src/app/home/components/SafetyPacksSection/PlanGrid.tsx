'use client';

import { useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { JOURNEY_ROUTES } from '@/app/(purchase-journey)/shared/routes';
import { useSafetyPlans } from '@/hooks/plans';
import { FALLBACK_SAFETY_PLANS, toSafetyPlan } from './constants';
import { PlanGridCard } from './PlanGridCard';
import styles from './grid.module.css';

export function PlanGrid() {
  const router = useRouter();
  const { data } = useSafetyPlans();
  // Prefer live plans; fall back to the static tiers so the grid always renders.
  const plans = useMemo(() => {
    const live = (data ?? []).map(toSafetyPlan);
    return live.length > 0 ? live : FALLBACK_SAFETY_PLANS;
  }, [data]);

  // The journey's plan picker (`/buy`) lists the live server plans (bearer-gated);
  // the home cards only carry presentation slugs, so every CTA lands there.
  const choosePlan = useCallback(() => {
    router.push(JOURNEY_ROUTES.buy);
  }, [router]);

  return (
    <div className={styles.grid}>
      {plans.map((plan) => (
        <PlanGridCard
          key={plan.id}
          plan={plan}
          onChoose={() => {
            choosePlan();
          }}
        />
      ))}
    </div>
  );
}
