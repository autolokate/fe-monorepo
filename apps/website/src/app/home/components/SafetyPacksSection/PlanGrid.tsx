'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { PURCHASE_ROUTE } from '@/app/(purchase)/purchase/constants';
import { writePurchaseIntent } from '@/app/(purchase)/purchase/storage';
import { useSafetyPlans } from '@/hooks/plans';
import { FALLBACK_SAFETY_PLANS, toSafetyPlan } from './constants';
import { PlanGridCard } from './PlanGridCard';
import styles from './grid.module.css';

export function PlanGrid() {
  const router = useRouter();
  const pathname = usePathname();
  const { data } = useSafetyPlans();
  // Prefer live plans; fall back to the static tiers so the grid always renders.
  const plans = useMemo(() => {
    const live = (data ?? []).map(toSafetyPlan);
    return live.length > 0 ? live : FALLBACK_SAFETY_PLANS;
  }, [data]);

  const choosePlan = useCallback(
    (planId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- usePathname() is typed string but can be null in practice; keep the fallback
      writePurchaseIntent({ plan: planId, from: pathname ?? '/' });
      router.push(PURCHASE_ROUTE);
    },
    [router, pathname],
  );

  return (
    <div className={styles.grid}>
      {plans.map((plan) => (
        <PlanGridCard
          key={plan.id}
          plan={plan}
          onChoose={() => {
            choosePlan(plan.id);
          }}
        />
      ))}
    </div>
  );
}
