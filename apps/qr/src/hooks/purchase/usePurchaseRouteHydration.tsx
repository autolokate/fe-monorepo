import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import type { LoadPlansResult } from '@/services/plan/plan-service';

import type { PurchaseCheckoutSession } from '@/features/qr-purchase/types-checkout';
import { DEFAULT_PURCHASE_PLAN_ID } from '@/features/qr-purchase/data/purchase-plans';
import { usePlans } from '@/hooks/plan/index';
import { getPurchasePlansCatalog } from '@/services/plan/plan-service';
import { resolveQrCode } from '@/services/qr/qr-service';
import { getResolvedQr, getVehicle } from '@/storage/index';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { reportUserError } from '@/platform/feedback/index';
import { planLogger } from '@/services/plan/plan-logger';
import { useJourney } from '@/journey/JourneyContext';

export type PurchaseRouteHydrationState = {
  isHydrating: boolean;
  plansRevision: number;
  plansReady: boolean;
};

const defaultHydrationState: PurchaseRouteHydrationState = {
  isHydrating: true,
  plansRevision: 0,
  plansReady: false,
};

const PurchaseHydrationContext = createContext<PurchaseRouteHydrationState>(defaultHydrationState);

let hydrationPromise: Promise<void> | null = null;

async function runPurchaseHydration(
  updateSession: ReturnType<typeof useJourney>['updateSession'],
  sessionPurchase: PurchaseCheckoutSession | undefined,
  loadPlans: () => Promise<LoadPlansResult>,
): Promise<void> {
  const journeyId = resolvePurchaseQrCode();
  if (journeyId && !getResolvedQr()?.qrCode) {
    await resolveQrCode(journeyId);
  }

  const vehicle = getVehicle();
  const purchasePatch: Partial<PurchaseCheckoutSession> = {};

  if (!sessionPurchase?.selectedPlanId) {
    purchasePatch.selectedPlanId =
      vehicle?.selectedPlanId ?? sessionPurchase?.selectedPlanId ?? DEFAULT_PURCHASE_PLAN_ID;
  }

  if (sessionPurchase?.riderCount === undefined) {
    purchasePatch.riderCount = vehicle?.riderCount ?? sessionPurchase?.riderCount ?? 1;
  }

  if (Object.keys(purchasePatch).length > 0) {
    updateSession({
      purchase: {
        ...(sessionPurchase ?? {}),
        ...purchasePatch,
      },
    });
  }

  const plansResult = await loadPlans();
  if (!plansResult.ok) {
    reportUserError(
      planLogger,
      'purchase_plans_reload_failed',
      plansResult.error,
      plansResult.error.message,
    );
  }
}

/** Provider — runs once per page load for all purchase routes. */
export function PurchaseRouteHydrationProvider({ children }: { children: ReactNode }) {
  const { session, updateSession } = useJourney();
  const { revision, ensurePlansLoaded: loadPlans } = usePlans();
  const [isHydrating, setIsHydrating] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!hydrationPromise) {
      hydrationPromise = runPurchaseHydration(updateSession, session.purchase, loadPlans);
    }

    void hydrationPromise.finally(() => {
      if (mountedRef.current) {
        setIsHydrating(false);
      }
    });

    return () => {
      mountedRef.current = false;
    };
  }, [loadPlans, session.purchase, updateSession]);

  const catalog = getPurchasePlansCatalog();
  const plansReady = catalog.some((plan) => plan.pricePaise > 0);

  const value: PurchaseRouteHydrationState = {
    isHydrating,
    plansRevision: revision,
    plansReady,
  };

  return (
    <PurchaseHydrationContext.Provider value={value}>{children}</PurchaseHydrationContext.Provider>
  );
}

export function usePurchaseRouteHydration(): PurchaseRouteHydrationState {
  return useContext(PurchaseHydrationContext);
}

/** Reset between Playwright / dev full-page tests. */
export function resetPurchaseRouteHydrationForTests(): void {
  hydrationPromise = null;
}
