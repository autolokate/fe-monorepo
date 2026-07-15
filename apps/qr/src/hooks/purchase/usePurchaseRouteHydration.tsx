import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

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
  /** Endpoint message after plans load fails twice; null while loading/ready. */
  hydrationError: string | null;
  retryHydration: () => void;
};

const defaultHydrationState: PurchaseRouteHydrationState = {
  isHydrating: true,
  plansRevision: 0,
  plansReady: false,
  hydrationError: null,
  retryHydration: () => undefined,
};

const PurchaseHydrationContext = createContext<PurchaseRouteHydrationState>(defaultHydrationState);

/** Coalesce StrictMode / remount so we don't fire parallel auto-retried loads. */
let hydrationInflight: Promise<LoadPlansResult | null> | null = null;
let hydrationGeneration = 0;

async function seedPurchaseSession(
  updateSession: ReturnType<typeof useJourney>['updateSession'],
  sessionPurchase: PurchaseCheckoutSession | undefined,
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
}

async function loadPlansWithAutoRetry(
  loadPlans: (options?: { force?: boolean }) => Promise<LoadPlansResult>,
  force: boolean,
): Promise<LoadPlansResult> {
  let result = await loadPlans({ force });
  if (!result.ok) {
    result = await loadPlans({ force: true });
  }
  return result;
}

/** Provider — runs once per page load for all purchase routes (retryable on failure). */
export function PurchaseRouteHydrationProvider({ children }: { children: ReactNode }) {
  const { session, updateSession } = useJourney();
  const { revision, ensurePlansLoaded: loadPlans } = usePlans();
  const [isHydrating, setIsHydrating] = useState(true);
  const [hydrationError, setHydrationError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const mountedRef = useRef(true);
  const attemptRef = useRef(attempt);
  attemptRef.current = attempt;
  const purchaseRef = useRef(session.purchase);
  purchaseRef.current = session.purchase;
  const seededRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const generation = attempt;
    setIsHydrating(true);
    setHydrationError(null);

    if (!hydrationInflight || attempt > 0) {
      hydrationGeneration = generation;
      hydrationInflight = (async () => {
        if (!seededRef.current) {
          await seedPurchaseSession(updateSession, purchaseRef.current);
          seededRef.current = true;
        }

        if (getPurchasePlansCatalog().length > 0 && generation === 0) {
          return null;
        }

        const plansResult = await loadPlansWithAutoRetry(loadPlans, generation > 0);
        if (!plansResult.ok) {
          reportUserError(
            planLogger,
            'purchase_plans_reload_failed',
            plansResult.error,
            plansResult.error.message,
            { toast: false },
          );
        }
        return plansResult;
      })().finally(() => {
        if (generation === hydrationGeneration) {
          hydrationInflight = null;
        }
      });
    }

    void hydrationInflight.then((plansResult) => {
      if (!mountedRef.current || generation !== attemptRef.current) {
        return;
      }

      if (plansResult && !plansResult.ok) {
        setHydrationError(
          plansResult.error.message.trim() || 'Something went wrong. Please try again.',
        );
      }
      setIsHydrating(false);
    });

    return () => {
      mountedRef.current = false;
    };
    // Do not depend on session.purchase — swiping plans updates purchase and must not re-hydrate.
  }, [attempt, loadPlans, updateSession]);

  const retryHydration = useCallback(() => {
    setAttempt((current) => current + 1);
  }, []);

  const catalog = getPurchasePlansCatalog();
  // Activation funded plans are ready once the catalog is populated (price may be 0 / "Included").
  const plansReady = catalog.length > 0;

  const value: PurchaseRouteHydrationState = {
    isHydrating,
    plansRevision: revision,
    plansReady,
    hydrationError: plansReady ? null : hydrationError,
    retryHydration,
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
  hydrationInflight = null;
  hydrationGeneration = 0;
}
