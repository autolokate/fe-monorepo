import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  R06ChoosePlanScreen,
  R07RiderCoverScreen,
  R08OrderSummaryScreen,
  R08bPromoAppliedScreen,
  R08cInvalidPromoScreen,
} from '../../../features/qr-purchase/screens/index';
import type {
  PurchasePlanId,
  PurchaseRiderCount,
} from '../../../features/qr-purchase/types-checkout';
import { usePlans } from '../../../hooks/plan/index';
import {
  getRiderOptionsForPlan,
  isIncludedActivationPlan,
  isPlanRiderEligible,
} from '@/services/plan/plan-mapper';
import {
  getFundedPurchasePlanId,
  getPurchasePlansCatalog,
} from '@/services/plan/plan-service';
import { useCartPricing } from '../../../hooks/checkout/index';
import { usePreventBrowserBack } from '@/platform/navigation/use-prevent-browser-back';
import { reportUserError } from '@/platform/feedback/index';
import { getAuthFlowBackPath } from '../../activation-routing';
import { persistPurchaseSelections } from '@/services/purchase/purchase-context-service';
import { clearPromoPreviewCache } from '@/services/promo/index';
import { planLogger } from '@/services/plan/plan-logger';
import { isCommercePrepaidFreePlan } from '@/journey/state/purchase-journey-state-machine';
import { useActiveJourneyId } from '../../routing/use-active-journey-id';
import { usePurchaseRouteHydration } from '../../../hooks/purchase/usePurchaseRouteHydration';
import { useRouteLoadWithRetry } from '../../../hooks/purchase/useRouteLoadWithRetry';
import { PurchaseRouteError } from '@/components/compositions/purchase-route-error/index';
import {
  purchaseJourneyPaths,
  purchaseVehicleConfirmationPath,
} from '../../purchase/purchase-paths-runtime';
import { useJourney } from '../../JourneyContext';
import { patchCheckoutCartPromo } from '@/services/cart/index';
import {
  applyPromoCode,
  buildCheckoutParams,
  getOrderSummaryPath,
  PurchaseRouteLoader,
  redirectIfPaymentSucceeded,
  startPayment,
  usePurchaseCheckout,
} from './purchase-route-shared';

function resolveSkipPlanId(planId: PurchasePlanId): PurchasePlanId {
  return getFundedPurchasePlanId() ?? planId;
}

export function ChoosePlanRoute() {
  const navigate = useNavigate();
  const { planId, patchPurchase, purchase } = usePurchaseCheckout();
  const { session, updateSession } = useJourney();
  const { plansReady: hydratedPlansReady } = usePurchaseRouteHydration();
  const { ensurePlansLoaded } = usePlans();
  const journeyId = useActiveJourneyId();
  const seededFundedRef = useRef(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const loadPlans = useCallback(
    async ({ force }: { force: boolean }) => {
      const result = await ensurePlansLoaded({ force });
      if (!result.ok) {
        reportUserError(
          planLogger,
          'purchase_plans_load_failed',
          result.error,
          result.error.message,
          { toast: false },
        );
        return { ok: false as const, message: result.error.message };
      }

      const fundedPlanId = result.fundedPlanId ?? getFundedPurchasePlanId();
      if (fundedPlanId && !seededFundedRef.current) {
        seededFundedRef.current = true;
        const currentSelected = sessionRef.current.purchase?.selectedPlanId;
        if (!currentSelected) {
          updateSession({
            purchase: {
              ...(sessionRef.current.purchase ?? {}),
              selectedPlanId: fundedPlanId,
            },
          });
        }
      }

      return { ok: true as const };
    },
    [ensurePlansLoaded, updateSession],
  );

  const { loadState, retry } = useRouteLoadWithRetry({
    // Hydration already loaded plans for the purchase segment; only re-fetch on Try again.
    initiallyReady: hydratedPlansReady || getPurchasePlansCatalog().length > 0,
    load: loadPlans,
  });

  // When hydration already filled the catalog, seed funded plan without a second network call.
  useEffect(() => {
    if (loadState.status !== 'ready' || seededFundedRef.current) {
      return;
    }
    const fundedPlanId = getFundedPurchasePlanId();
    if (!fundedPlanId) {
      return;
    }
    seededFundedRef.current = true;
    const currentSelected = sessionRef.current.purchase?.selectedPlanId;
    if (!currentSelected) {
      updateSession({
        purchase: {
          ...(sessionRef.current.purchase ?? {}),
          selectedPlanId: fundedPlanId,
        },
      });
    }
  }, [loadState.status, updateSession]);

  // Plans are first after auth; lock back once upgrade payment succeeds later.
  const lockBack = purchase?.paymentStatus === 'success';

  usePreventBrowserBack(lockBack);

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  const continueWithSkip = () => {
    const selected = resolveSkipPlanId(planId);
    persistPurchaseSelections({ selectedPlanId: selected, riderCount: 0 });
    patchPurchase({
      selectedPlanId: selected,
      riderCount: 0,
      skippedPlanUpgrade: true,
      upgradeCheckout: false,
      promoApplied: false,
      promoInvalid: false,
      promoCode: null,
    });
    void navigate(purchaseJourneyPaths.vehicleDetails);
  };

  const continueWithUpgrade = () => {
    persistPurchaseSelections({ selectedPlanId: planId, riderCount: 0 });
    patchPurchase({
      selectedPlanId: planId,
      riderCount: 0,
      skippedPlanUpgrade: false,
      upgradeCheckout: true,
      promoApplied: false,
      promoInvalid: false,
      promoCode: null,
      checkoutReady: false,
      paymentStatus: 'idle',
    });
    void navigate(purchaseJourneyPaths.vehicleDetails);
  };

  if (loadState.status === 'loading') {
    return <PurchaseRouteLoader label="Loading plans" />;
  }

  if (loadState.status === 'error') {
    return (
      <PurchaseRouteError
        message={loadState.message}
        onRetry={retry}
        showBack={!lockBack}
        onBack={
          lockBack
            ? undefined
            : () => {
                void navigate(getAuthFlowBackPath('purchase', journeyId ?? undefined));
              }
        }
      />
    );
  }

  const catalog = getPurchasePlansCatalog();
  const isIncludedPlan = isIncludedActivationPlan(catalog, planId);

  return (
    <R06ChoosePlanScreen
      selectedPlanId={planId}
      isIncludedPlan={isIncludedPlan}
      showBack={!lockBack}
      onSelectPlan={(id: PurchasePlanId) => {
        patchPurchase({ selectedPlanId: id });
      }}
      onBack={
        lockBack
          ? undefined
          : () => {
              void navigate(getAuthFlowBackPath('purchase', journeyId ?? undefined));
            }
      }
      onContinue={() => {
        // Included / funded plan → Continue (skip payment). Paid upgrade → vehicle → checkout.
        if (isCommercePrepaidFreePlan(planId) || isIncludedPlan) {
          continueWithSkip();
          return;
        }
        continueWithUpgrade();
      }}
      onSkip={isIncludedPlan ? undefined : continueWithSkip}
    />
  );
}

export function RiderCoverRoute() {
  const navigate = useNavigate();
  const { session, planId, riderCount, patchPurchase, purchase } = usePurchaseCheckout();
  const { isHydrating } = usePurchaseRouteHydration();
  const { ensurePlansLoaded, revision: plansRevision } = usePlans();
  const plate = session.vehicle?.plate;

  const loadRiderPlans = useCallback(
    async ({ force }: { force: boolean }) => {
      const result = await ensurePlansLoaded({ force });
      if (!result.ok) {
        reportUserError(
          planLogger,
          'rider_cover_plans_reload_failed',
          result.error,
          result.error.message,
          { toast: false },
        );
        return { ok: false as const, message: result.error.message };
      }
      return { ok: true as const };
    },
    [ensurePlansLoaded],
  );

  const { loadState, retry } = useRouteLoadWithRetry({
    enabled: !isHydrating,
    initiallyReady: !isHydrating && getPurchasePlansCatalog().length > 0,
    load: loadRiderPlans,
  });

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  const catalog = getPurchasePlansCatalog();
  const riderOptions = getRiderOptionsForPlan(catalog, planId);
  const selectedRiderCount: Exclude<PurchaseRiderCount, 0> =
    riderCount === 0 ? (riderOptions[0]?.riderCount ?? 1) : riderCount;
  const plansReady = loadState.status === 'ready';

  // Keep purchase session rider selection aligned with freshly loaded options.
  useEffect(() => {
    if (!plansReady || riderOptions.length === 0) {
      return;
    }
    const optionCounts = new Set(riderOptions.map((option) => option.riderCount));
    if (riderCount === 0 || !optionCounts.has(riderCount)) {
      const nextCount = riderOptions[0]?.riderCount ?? 1;
      patchPurchase({ riderCount: nextCount });
    }
  }, [plansReady, plansRevision, planId, riderCount, patchPurchase, riderOptions]);

  const goToSummary = (count: PurchaseRiderCount) => {
    persistPurchaseSelections({ riderCount: count });
    patchPurchase({ riderCount: count, promoApplied: false, promoCode: null });
    void navigate(purchaseJourneyPaths.orderSummary);
  };

  useEffect(() => {
    if (!plansReady) {
      return;
    }
    if (!isPlanRiderEligible(catalog, planId) || riderOptions.length === 0) {
      void navigate(purchaseJourneyPaths.orderSummary, { replace: true });
    }
  }, [catalog, navigate, planId, plansReady, riderOptions.length]);

  if (isHydrating || loadState.status === 'loading') {
    return <PurchaseRouteLoader label="Loading rider cover" />;
  }

  if (loadState.status === 'error') {
    return (
      <PurchaseRouteError
        message={loadState.message}
        onRetry={retry}
        showBack
        onBack={() => {
          void navigate(
            plate
              ? purchaseVehicleConfirmationPath(plate)
              : purchaseJourneyPaths.vehicleDetails,
          );
        }}
      />
    );
  }

  if (!isPlanRiderEligible(catalog, planId) || riderOptions.length === 0) {
    return null;
  }

  return (
    <R07RiderCoverScreen
      key={String(plansRevision)}
      selectedPlanId={planId}
      riderOptions={riderOptions}
      selectedRiderCount={selectedRiderCount}
      onSelectRiderCount={(count) => {
        patchPurchase({ riderCount: count });
      }}
      onSkip={() => {
        goToSummary(0);
      }}
      onBack={() => {
        void navigate(
          plate
            ? purchaseVehicleConfirmationPath(plate)
            : purchaseJourneyPaths.vehicleDetails,
        );
      }}
      onContinue={() => {
        goToSummary(selectedRiderCount);
      }}
    />
  );
}

export function OrderSummaryRoute() {
  const navigate = useNavigate();
  const { planId, riderCount, purchase, patchPurchase } = usePurchaseCheckout();
  const { plansRevision, plansReady } = usePurchaseRouteHydration();
  const checkoutParams = buildCheckoutParams(planId, riderCount, {
    ...purchase,
    promoApplied: false,
    promoCode: null,
  });
  const { cartReady, cartLoading, cartRevision, cartError, retryCart } =
    useCartPricing(checkoutParams);
  const [promoInput, setPromoInput] = useState(purchase?.promoCode ?? '');
  const [promoApplying, setPromoApplying] = useState(false);

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  // Initial load only — cart errors stay on Review & pay above the Pay CTA.
  if (!plansReady || (!cartReady && !cartError)) {
    return <PurchaseRouteLoader label="Loading order" />;
  }

  return (
    <R08OrderSummaryScreen
      key={`${String(plansRevision)}-${String(cartRevision)}`}
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoInput}
      onPromoCodeChange={setPromoInput}
      isApplyingPromo={promoApplying}
      errorMessage={cartError}
      footerLabel={cartError ? 'Try again' : undefined}
      footerLoading={Boolean(cartError) && cartLoading}
      onApplyPromo={() => {
        if (purchase?.paymentStatus === 'success') {
          redirectIfPaymentSucceeded(navigate, purchase);
          return;
        }
        setPromoApplying(true);
        void applyPromoCode(promoInput, { planId, riderCount }, patchPurchase, navigate).finally(() => {
          setPromoApplying(false);
        });
      }}
      onBack={() => {
        const catalog = getPurchasePlansCatalog();
        const riderOptions = getRiderOptionsForPlan(catalog, planId);
        if (isPlanRiderEligible(catalog, planId) && riderOptions.length > 0) {
          void navigate(purchaseJourneyPaths.riderCover);
          return;
        }
        void navigate(purchaseJourneyPaths.vehicleDetails);
      }}
      onContinue={() => {
        if (cartError) {
          retryCart();
          return;
        }
        startPayment(patchPurchase, navigate, purchase, {
          planId,
          riderCount,
          promoApplied: false,
          promoCode: null,
        });
      }}
    />
  );
}

export function OrderSummaryInvalidPromoRoute() {
  const navigate = useNavigate();
  const { session, planId, riderCount, purchase, patchPurchase } = usePurchaseCheckout();
  const checkoutParams = buildCheckoutParams(planId, riderCount, {
    ...purchase,
    promoApplied: false,
    promoCode: null,
  });
  const { cartReady, cartLoading, cartRevision, cartError, retryCart } =
    useCartPricing(checkoutParams);
  const [promoInput, setPromoInput] = useState(purchase?.promoCode ?? '');
  const [promoApplying, setPromoApplying] = useState(false);

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!session.purchase?.promoInvalid || !session.purchase.promoCode) {
      void navigate(purchaseJourneyPaths.orderSummary, { replace: true });
    }
  }, [navigate, purchase, session.purchase?.promoCode, session.purchase?.promoInvalid]);

  if (!cartReady && !cartError) {
    return <PurchaseRouteLoader label="Loading order" />;
  }

  return (
    <R08cInvalidPromoScreen
      key={cartRevision}
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoInput}
      isApplyingPromo={promoApplying}
      errorMessage={cartError}
      footerLabel={cartError ? 'Try again' : undefined}
      footerLoading={Boolean(cartError) && cartLoading}
      onPromoCodeChange={(code) => {
        setPromoInput(code);
        if (purchase?.promoInvalid) {
          patchPurchase({ promoInvalid: false });
        }
      }}
      onApplyPromo={() => {
        setPromoApplying(true);
        void applyPromoCode(promoInput, { planId, riderCount }, patchPurchase, navigate).finally(() => {
          setPromoApplying(false);
        });
      }}
      onBack={() => {
        patchPurchase({ promoInvalid: false, promoCode: null });
        clearPromoPreviewCache();
        void navigate(purchaseJourneyPaths.orderSummary);
      }}
      onContinue={() => {
        if (cartError) {
          retryCart();
          return;
        }
        startPayment(patchPurchase, navigate, purchase, {
          planId,
          riderCount,
          promoApplied: false,
          promoCode: null,
        });
      }}
    />
  );
}

export function OrderSummaryPromoAppliedRoute() {
  const navigate = useNavigate();
  const { session, planId, riderCount, purchase, patchPurchase } = usePurchaseCheckout();
  const promoCode = purchase?.promoCode ?? '';
  const checkoutParams = buildCheckoutParams(planId, riderCount, purchase);
  const { cartReady, cartLoading, cartRevision, cartError, retryCart } =
    useCartPricing(checkoutParams);

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!session.purchase?.promoApplied || !session.purchase.promoCode) {
      void navigate(getOrderSummaryPath(false, session.purchase?.promoInvalid), { replace: true });
    }
  }, [navigate, purchase, session.purchase?.promoApplied, session.purchase?.promoCode, session.purchase?.promoInvalid]);

  if (!cartReady && !cartError) {
    return <PurchaseRouteLoader label="Loading order" />;
  }

  return (
    <R08bPromoAppliedScreen
      key={cartRevision}
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoCode}
      errorMessage={cartError}
      footerLabel={cartError ? 'Try again' : undefined}
      footerLoading={Boolean(cartError) && cartLoading}
      onRemovePromo={() => {
        if (purchase?.paymentStatus === 'success') {
          redirectIfPaymentSucceeded(navigate, purchase);
          return;
        }
        void patchCheckoutCartPromo(
          { planId, riderCount, promoApplied: false, promoCode: null },
          null,
        ).finally(() => {
          patchPurchase({ promoApplied: false, promoCode: null });
          void navigate(purchaseJourneyPaths.orderSummary);
        });
      }}
      onBack={() => {
        void navigate(purchaseJourneyPaths.orderSummary);
      }}
      onContinue={() => {
        if (cartError) {
          retryCart();
          return;
        }
        startPayment(patchPurchase, navigate, purchase, {
          planId,
          riderCount,
          promoApplied: true,
          promoCode: purchase?.promoCode ?? null,
        });
      }}
    />
  );
}
