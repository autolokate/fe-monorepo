import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Navigate, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';

import { formatPlateInput } from '@autolokate/ui';

import {
  isPlateEntryReady,
  normalizePlate,
} from '../../services/vehicle/index.js';
import { useVehicleLookup } from '../../hooks/vehicle/index.js';
import {
  R03VehicleNumberScreen,
  R04FetchingVehicleScreen,
  R04bFetchFailedScreen,
  R05ConfirmVehicleScreen,
  R06ChoosePlanScreen,
  R07RiderCoverScreen,
  R08OrderSummaryScreen,
  R08bPromoAppliedScreen,
  R08cInvalidPromoScreen,
  R09ProcessingPaymentScreen,
  R09bStillConfirmingScreen,
  R10PaymentSuccessScreen,
  R10bPaymentFailedScreen,
  R10cPaymentUnconfirmedScreen,
} from '../../features/qr-purchase/screens/index.js';
import type { PurchaseVehiclePlateState } from '../../features/qr-purchase/types-vehicle.js';
import type {
  PurchasePlanId,
  PurchaseRiderCount,
} from '../../features/qr-purchase/types-checkout.js';
import { DEFAULT_PURCHASE_PLAN_ID, VALID_PROMO_CODE } from '../../features/qr-purchase/data/purchase-plans.js';
import { buildOrderSummary } from '../../features/qr-purchase/data/purchase-pricing.js';
import { normalizePromoCode } from '../../features/qr-purchase/data/purchase-promo.js';
import { usePlans } from '../../hooks/plan/index.js';
import { getRiderOptionsForPlan, isPlanRiderEligible } from '@/services/plan/plan-mapper.js';
import { getPurchasePlansCatalog } from '@/services/plan/plan-service.js';
import { useCheckout } from '../../hooks/checkout/index.js';
import { usePaymentPolling } from '../../hooks/checkout/index.js';
import { useQrAttach } from '../../hooks/qr/index.js';
import { getStoredPurchaseQrResolve } from '@/services/qr/qr-service.js';
import {
  getCheckoutSummary,
  peekOrderId,
  resetCheckoutForRetry,
  type CheckoutParams,
} from '../../services/checkout/index.js';
import { syncVehiclesAfterPayment } from '@/services/vehicle/vehicle-sync-service.js';
import { persistQrCodeFromUrl } from '@/platform/qr/qr-code-from-url.js';
import { reportUserError } from '@/platform/feedback/index.js';
import { getPurchasePostPaymentEmergencyPath } from '../activation-routing.js';
import { persistPurchaseSelections, persistVehicleContext } from '@/services/purchase/purchase-context-service.js';
import { resetPurchaseFlowState } from '@/services/purchase/reset-purchase-flow-state.js';
import { isPageReload } from '@/platform/navigation/is-page-reload.js';
import { checkoutLogger } from '@/services/checkout/checkout-logger.js';
import { planLogger } from '@/services/plan/plan-logger.js';
import { PurchaseAttachErrorSheet } from '../../features/qr-purchase/components/PurchaseAttachErrorSheet.js';
import { resetAttachAttemptCache } from '@/services/qr/qr-attach-service.js';
import { purchaseStorageRepository } from '@/platform/storage/repositories/purchase-storage-repository.js';
import {
  PURCHASE_ROUTE_ID,
} from '@/journey/state/purchase-journey-state-machine.js';
import { PurchaseRouteGate } from '../guards/PurchaseRouteGate.js';
import { PurchaseIndexRedirect } from '../guards/PurchaseIndexRedirect.js';
import type { QrAttachError } from '@/services/qr/qr-attach-errors.js';
import { qrAttachLogger } from '@/services/qr/qr-attach-logger.js';
import { qrLogger } from '@/services/qr/qr-logger.js';
import { vehicleLogger } from '@/services/vehicle/vehicle-logger.js';
import { authJourneyPaths } from '../auth/auth-routing.js';
import { useJourney } from '../JourneyContext.js';
import { purchaseJourneyPaths, legacyPurchasePathRedirects, PURCHASE_ROUTE_SEGMENTS } from '../purchase/purchase-routing.js';

function PurchaseSegmentBootstrap({ children }: { children: ReactNode }) {
  const { setPhase } = useJourney();

  useEffect(() => {
    setPhase('activation');
  }, [setPhase]);

  return children;
}

function usePurchaseCheckout() {
  const { session, updateSession } = useJourney();
  const purchase = session.purchase;
  const planId = purchase?.selectedPlanId ?? DEFAULT_PURCHASE_PLAN_ID;
  const riderCount = purchase?.riderCount ?? 1;

  const patchPurchase = useCallback(
    (patch: Partial<NonNullable<typeof session.purchase>>) => {
      updateSession({
        purchase: {
          ...(session.purchase ?? {}),
          ...patch,
        },
      });
    },
    [session.purchase, updateSession],
  );

  return { session, purchase, planId, riderCount, patchPurchase, updateSession };
}

function getOrderSummaryPath(promoApplied?: boolean, promoInvalid?: boolean) {
  if (promoInvalid) {
    return purchaseJourneyPaths.orderSummaryInvalidPromo;
  }
  return promoApplied ? purchaseJourneyPaths.orderSummaryPromoApplied : purchaseJourneyPaths.orderSummary;
}

/** After payment success, resume at R10 until the user continues to emergency. */
function getPostPaymentSuccessPath(): string {
  return purchaseJourneyPaths.paymentSuccess;
}

function getPostPaymentResumePath(purchase: ReturnType<typeof usePurchaseCheckout>['purchase']): string | null {
  if (!purchase?.checkoutReady) {
    return null;
  }

  switch (purchase.paymentStatus) {
    case 'success':
      return getPostPaymentSuccessPath();
    case 'unconfirmed':
      return purchaseJourneyPaths.paymentUnconfirmed;
    case 'confirming':
      return purchaseJourneyPaths.paymentStillConfirming;
    case 'failed':
      return purchaseJourneyPaths.paymentFailed;
    default:
      return null;
  }
}

function redirectIfPaymentSucceeded(
  navigate: ReturnType<typeof useNavigate>,
  purchase: ReturnType<typeof usePurchaseCheckout>['purchase'],
): boolean {
  const resumePath = getPostPaymentResumePath(purchase);
  if (!resumePath) {
    return false;
  }
  void navigate(resumePath, { replace: true });
  return true;
}

/** Avoid redirect races while paymentStatus transitions between payment screens. */
function shouldLeavePaymentScreen(
  current: ReturnType<typeof usePurchaseCheckout>['purchase'] | undefined,
  allowed: Array<NonNullable<ReturnType<typeof usePurchaseCheckout>['purchase']>['paymentStatus']>,
): boolean {
  const status = current?.paymentStatus;
  if (!status) {
    return true;
  }
  return !allowed.includes(status);
}

function buildCheckoutParams(
  planId: PurchasePlanId,
  riderCount: PurchaseRiderCount,
  purchase: ReturnType<typeof usePurchaseCheckout>['purchase'],
): CheckoutParams {
  return {
    planId,
    riderCount,
    promoApplied: purchase?.promoApplied,
    promoCode: purchase?.promoCode,
  };
}

function patchPaymentOutcome(
  patchPurchase: ReturnType<typeof usePurchaseCheckout>['patchPurchase'],
  navigate: ReturnType<typeof useNavigate>,
  paymentStatus: 'success' | 'failed' | 'unconfirmed' | 'confirming',
) {
  const summary = getCheckoutSummary();
  const paidAmountInr = summary?.totalInr ?? 0;

  if (paymentStatus === 'success') {
    patchPurchase({ paymentStatus: 'success', paidAmountInr });
    void navigate(purchaseJourneyPaths.paymentSuccess, { replace: true });
    return;
  }
  if (paymentStatus === 'confirming') {
    patchPurchase({ paymentStatus: 'confirming', paidAmountInr });
    void navigate(purchaseJourneyPaths.paymentStillConfirming, { replace: true });
    return;
  }
  if (paymentStatus === 'unconfirmed') {
    patchPurchase({ paymentStatus: 'unconfirmed', paidAmountInr });
    void navigate(purchaseJourneyPaths.paymentUnconfirmed, { replace: true });
    return;
  }
  patchPurchase({ paymentStatus: 'failed' });
  void navigate(purchaseJourneyPaths.paymentFailed);
}

function applyPromoCode(
  code: string,
  patchPurchase: ReturnType<typeof usePurchaseCheckout>['patchPurchase'],
  navigate: ReturnType<typeof useNavigate>,
) {
  const normalized = normalizePromoCode(code);
  if (!normalized) {
    return;
  }

  patchPurchase({
    promoApplied: true,
    promoCode: normalized,
    promoInvalid: false,
  });
  void navigate(purchaseJourneyPaths.orderSummaryPromoApplied);
}

function startPayment(
  patchPurchase: ReturnType<typeof usePurchaseCheckout>['patchPurchase'],
  navigate: ReturnType<typeof useNavigate>,
  purchase: ReturnType<typeof usePurchaseCheckout>['purchase'],
  params: {
    planId: PurchasePlanId;
    riderCount: PurchaseRiderCount;
    promoApplied?: boolean;
    promoCode?: string | null;
  },
) {
  if (purchase?.paymentStatus === 'success' && purchase.checkoutReady) {
    void navigate(getPostPaymentSuccessPath(), { replace: true });
    return;
  }

  const summary = buildOrderSummary({
    planId: params.planId,
    riderCount: params.riderCount,
    promoApplied: params.promoApplied,
    promoCode: params.promoCode,
  });

  flushSync(() => {
    patchPurchase({
      selectedPlanId: params.planId,
      riderCount: params.riderCount,
      checkoutReady: true,
      paymentStatus: 'processing',
      paidAmountInr: summary.totalInr,
    });
  });

  void navigate(purchaseJourneyPaths.processingPayment);
}

function VehicleDetailsRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, updateSession } = useJourney();
  const { purchase } = usePurchaseCheckout();
  const vehicle = session.vehicle ?? {};

  const [plate, setPlate] = useState(() => formatPlateInput(vehicle.plate ?? ''));
  const [plateState, setPlateState] = useState<PurchaseVehiclePlateState>(() => {
    if (vehicle.fetchStatus === 'not-found') {
      return 'error';
    }
    if (vehicle.plate?.trim()) {
      return 'filled';
    }
    return 'empty';
  });

  useEffect(() => {
    if (vehicle.fetchStatus === 'not-found') {
      setPlateState('error');
    }
  }, [vehicle.fetchStatus]);

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  useEffect(() => {
    persistQrCodeFromUrl(searchParams);
    const stored = getStoredPurchaseQrResolve();
    if (!stored.ok) {
      reportUserError(qrLogger, 'purchase_resolve_missing', stored.error, stored.error.message);
    }
  }, [searchParams]);

  const handleFetch = useCallback(() => {
    const normalized = normalizePlate(plate);

    if (!isPlateEntryReady(normalized)) {
      updateSession({
        vehicle: {
          ...vehicle,
          plate: normalized,
          fetchStatus: 'not-found',
        },
      });
      setPlateState('error');
      return;
    }

    updateSession({
      vehicle: {
        ...vehicle,
        plate: normalized,
        fetchStatus: 'fetching',
      },
    });
    void navigate(purchaseJourneyPaths.vehicleLookup);
  }, [navigate, plate, updateSession, vehicle]);

  return (
    <R03VehicleNumberScreen
      plateValue={plate}
      plateState={plateState}
      onPlateChange={(value) => {
        setPlate(value);
        if (plateState === 'error') {
          setPlateState(value.trim() ? 'filled' : 'empty');
          updateSession({
            vehicle: {
              ...vehicle,
              plate: normalizePlate(value),
              fetchStatus: 'idle',
            },
          });
        } else {
          setPlateState(value.trim() ? 'filled' : 'empty');
        }
      }}
      onBack={() => {
        void navigate(authJourneyPaths.vehicleOwner);
      }}
      onContinue={handleFetch}
    />
  );
}

function VehicleLookupRoute() {
  const navigate = useNavigate();
  const { session, updateSession } = useJourney();
  const { purchase } = usePurchaseCheckout();
  const { lookupVehicle } = useVehicleLookup();
  const plate = session.vehicle?.plate ?? '';

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!plate) {
      void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
      return;
    }

    if (!isPlateEntryReady(plate)) {
      updateSession({
        vehicle: {
          plate: normalizePlate(plate),
          fetchStatus: 'not-found',
        },
      });
      void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
      return;
    }

    const abortController = new AbortController();

    void (async () => {
      const result = await lookupVehicle(plate);

      if (abortController.signal.aborted) {
        return;
      }

      if (result.status === 'success') {
        updateSession({
          vehicle: {
            plate: result.plate,
            fields: result.fields,
            fetchStatus: 'success',
          },
        });
        void navigate(purchaseJourneyPaths.vehicleConfirmation, { replace: true });
        return;
      }

      if (result.status === 'error') {
        reportUserError(
          vehicleLogger,
          'purchase_vehicle_lookup_failed',
          result,
          'Unable to fetch vehicle details. Please try again.',
        );
      }

      updateSession({
        vehicle: {
          plate: result.plate,
          fetchStatus: 'error',
        },
      });
      void navigate(purchaseJourneyPaths.vehicleLookupFailed, { replace: true });
    })();

    return () => {
      abortController.abort();
    };
  }, [lookupVehicle, navigate, plate, purchase, updateSession]);

  return <R04FetchingVehicleScreen />;
}

function VehicleLookupFailedRoute() {
  const navigate = useNavigate();
  const { session, purchase, updateSession } = usePurchaseCheckout();
  const vehicle = session.vehicle ?? {};

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  return (
    <R04bFetchFailedScreen
      onRetry={() => {
        updateSession({
          vehicle: {
            ...vehicle,
            fetchStatus: 'idle',
          },
        });
        void navigate(purchaseJourneyPaths.vehicleDetails);
      }}
      onEnterManually={() => {
        updateSession({
          vehicle: {
            ...vehicle,
            fetchStatus: 'not-found',
          },
        });
        void navigate(purchaseJourneyPaths.vehicleDetails);
      }}
    />
  );
}

function VehicleConfirmationRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, updateSession } = useJourney();
  const { purchase } = usePurchaseCheckout();
  const { attachPurchaseQr } = useQrAttach();
  const [isAttaching, setIsAttaching] = useState(false);
  const [attachError, setAttachError] = useState<QrAttachError | null>(null);
  const vehicle = session.vehicle ?? {};

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!vehicle.plate || vehicle.fetchStatus !== 'success' || !vehicle.fields?.length) {
      void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
    }
  }, [navigate, purchase, vehicle.fields, vehicle.fetchStatus, vehicle.plate]);

  const runAttach = useCallback(() => {
    if (isAttaching) {
      return;
    }
    setAttachError(null);
    persistVehicleContext({
      registration: vehicle.plate ?? '',
      fields: vehicle.fields,
      ownerName: session.auth?.ownerName,
      languageId: session.auth?.languageId,
      selectedPlanId: DEFAULT_PURCHASE_PLAN_ID,
      riderCount: 1,
    });
    setIsAttaching(true);
    void attachPurchaseQr(searchParams).then((result) => {
      setIsAttaching(false);
      if (!result.ok) {
        purchaseStorageRepository.clearAttachResult();
        resetAttachAttemptCache();
        updateSession({
          vehicle: {
            ...vehicle,
            confirmed: false,
          },
        });
        qrAttachLogger.warn('purchase_attach_failed', {
          code: result.error.code,
          message: result.error.message,
        });
        setAttachError(result.error);
        return;
      }
      updateSession({
        vehicle: {
          ...vehicle,
          confirmed: true,
        },
        purchase: {
          selectedPlanId: DEFAULT_PURCHASE_PLAN_ID,
          riderCount: 1,
          promoApplied: false,
          promoCode: null,
          promoInvalid: false,
          checkoutReady: false,
          paymentStatus: 'idle',
        },
      });
      void navigate(purchaseJourneyPaths.choosePlan);
    });
  }, [
    attachPurchaseQr,
    isAttaching,
    navigate,
    searchParams,
    session.auth?.languageId,
    session.auth?.ownerName,
    updateSession,
    vehicle,
  ]);

  return (
    <>
      <R05ConfirmVehicleScreen
        plate={vehicle.plate}
        fields={vehicle.fields}
        footerLoading={isAttaching}
        onBack={() => {
          void navigate(purchaseJourneyPaths.vehicleDetails);
        }}
        onContinue={runAttach}
      />
      <PurchaseAttachErrorSheet
        open={attachError !== null}
        error={attachError}
        onRetry={() => {
          resetAttachAttemptCache();
          runAttach();
        }}
        onDismiss={() => {
          setAttachError(null);
        }}
      />
    </>
  );
}

function ChoosePlanRoute() {
  const navigate = useNavigate();
  const { planId, patchPurchase, purchase } = usePurchaseCheckout();
  const { ensurePlansLoaded, revision } = usePlans();

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  useEffect(() => {
    void ensurePlansLoaded().then((result) => {
      if (!result.ok) {
        reportUserError(planLogger, 'purchase_plans_load_failed', result.error, result.error.message);
      }
    });
  }, [ensurePlansLoaded]);

  return (
    <R06ChoosePlanScreen
      key={revision}
      selectedPlanId={planId}
      onSelectPlan={(id: PurchasePlanId) => {
        patchPurchase({ selectedPlanId: id });
      }}
      onBack={() => {
        void navigate(purchaseJourneyPaths.vehicleConfirmation);
      }}
      onContinue={() => {
        persistPurchaseSelections({ selectedPlanId: planId });
        patchPurchase({ selectedPlanId: planId });
        const catalog = getPurchasePlansCatalog();
        if (isPlanRiderEligible(catalog, planId) && getRiderOptionsForPlan(catalog, planId).length > 0) {
          void navigate(purchaseJourneyPaths.riderCover);
        } else {
          persistPurchaseSelections({ riderCount: 0 });
          patchPurchase({ riderCount: 0 });
          void navigate(purchaseJourneyPaths.orderSummary);
        }
      }}
    />
  );
}

function RiderCoverRoute() {
  const navigate = useNavigate();
  const { planId, riderCount, patchPurchase, purchase } = usePurchaseCheckout();
  const catalog = getPurchasePlansCatalog();
  const riderOptions = getRiderOptionsForPlan(catalog, planId);
  const selectedRiderCount: Exclude<PurchaseRiderCount, 0> =
    riderCount === 0 ? (riderOptions[0]?.riderCount ?? 1) : riderCount;

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  const goToSummary = (count: PurchaseRiderCount) => {
    persistPurchaseSelections({ riderCount: count });
    patchPurchase({ riderCount: count, promoApplied: false, promoCode: null });
    void navigate(purchaseJourneyPaths.orderSummary);
  };

  useEffect(() => {
    if (!isPlanRiderEligible(catalog, planId) || riderOptions.length === 0) {
      void navigate(purchaseJourneyPaths.orderSummary, { replace: true });
    }
  }, [catalog, navigate, planId, riderOptions.length]);

  if (!isPlanRiderEligible(catalog, planId) || riderOptions.length === 0) {
    return null;
  }
  return (
    <R07RiderCoverScreen
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
        void navigate(purchaseJourneyPaths.choosePlan);
      }}
      onContinue={() => {
        goToSummary(selectedRiderCount);
      }}
    />
  );
}

function OrderSummaryRoute() {
  const navigate = useNavigate();
  const { planId, riderCount, purchase, patchPurchase, updateSession } = usePurchaseCheckout();
  const [promoInput, setPromoInput] = useState(purchase?.promoCode ?? '');
  const resetOnReloadRef = useRef(isPageReload());

  useLayoutEffect(() => {
    if (!resetOnReloadRef.current) {
      return;
    }
    resetPurchaseFlowState();
    updateSession({ vehicle: undefined, purchase: undefined });
    void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
  }, [navigate, updateSession]);

  useEffect(() => {
    if (resetOnReloadRef.current) {
      return;
    }
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  if (resetOnReloadRef.current) {
    return null;
  }

  return (
    <R08OrderSummaryScreen
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoInput}
      onPromoCodeChange={setPromoInput}
      onApplyPromo={() => {
        if (purchase?.paymentStatus === 'success') {
          redirectIfPaymentSucceeded(navigate, purchase);
          return;
        }
        applyPromoCode(promoInput, patchPurchase, navigate);
      }}
      onBack={() => {
        void navigate(purchaseJourneyPaths.riderCover);
      }}
      onContinue={() => {
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

function OrderSummaryInvalidPromoRoute() {
  const navigate = useNavigate();
  const { session, planId, riderCount, purchase, patchPurchase } = usePurchaseCheckout();
  const [promoInput, setPromoInput] = useState(purchase?.promoCode ?? '');

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!session.purchase?.promoInvalid || !session.purchase.promoCode) {
      void navigate(purchaseJourneyPaths.orderSummary, { replace: true });
    }
  }, [navigate, purchase, session.purchase?.promoCode, session.purchase?.promoInvalid]);

  return (
    <R08cInvalidPromoScreen
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoInput}
      onPromoCodeChange={(code) => {
        setPromoInput(code);
        if (purchase?.promoInvalid) {
          patchPurchase({ promoInvalid: false });
        }
      }}
      onApplyPromo={() => {
        applyPromoCode(promoInput, patchPurchase, navigate);
      }}
      onBack={() => {
        patchPurchase({ promoInvalid: false, promoCode: null });
        void navigate(purchaseJourneyPaths.orderSummary);
      }}
      onContinue={() => {
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

function OrderSummaryPromoAppliedRoute() {
  const navigate = useNavigate();
  const { session, planId, riderCount, purchase, patchPurchase } = usePurchaseCheckout();
  const promoCode = purchase?.promoCode ?? VALID_PROMO_CODE;

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!session.purchase?.promoApplied || !session.purchase.promoCode) {
      void navigate(getOrderSummaryPath(false, session.purchase?.promoInvalid), { replace: true });
    }
  }, [navigate, purchase, session.purchase?.promoApplied, session.purchase?.promoCode, session.purchase?.promoInvalid]);

  return (
    <R08bPromoAppliedScreen
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoCode}
      onRemovePromo={() => {
        if (purchase?.paymentStatus === 'success') {
          redirectIfPaymentSucceeded(navigate, purchase);
          return;
        }
        patchPurchase({ promoApplied: false, promoCode: null });
        void navigate(purchaseJourneyPaths.orderSummary);
      }}
      onBack={() => {
        void navigate(purchaseJourneyPaths.orderSummary);
      }}
      onContinue={() => {
        startPayment(patchPurchase, navigate, purchase, {
          planId,
          riderCount,
          promoApplied: true,
          promoCode: purchase?.promoCode ?? VALID_PROMO_CODE,
        });
      }}
    />
  );
}

function ProcessingPaymentRoute() {
  const navigate = useNavigate();
  const { session, planId, riderCount, purchase, patchPurchase } = usePurchaseCheckout();
  const { executePayment } = usePaymentPolling();

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (
      !session.purchase?.checkoutReady ||
      shouldLeavePaymentScreen(session.purchase, ['processing', 'confirming'])
    ) {
      void navigate(getOrderSummaryPath(session.purchase?.promoApplied, session.purchase?.promoInvalid), {
        replace: true,
      });
    }
  }, [
    navigate,
    purchase,
    session.purchase?.checkoutReady,
    session.purchase?.paymentStatus,
    session.purchase?.promoApplied,
    session.purchase?.promoInvalid,
  ]);

  useEffect(() => {
    if (session.purchase?.paymentStatus !== 'processing' || purchase?.paymentStatus === 'success') {
      return;
    }

    const abortController = new AbortController();

    void (async () => {
      const result = await executePayment(
        buildCheckoutParams(planId, riderCount, session.purchase),
      );

      if (abortController.signal.aborted) {
        return;
      }

      if (!result.ok) {
        if (result.phase === 'prepare' || result.error.code === 'payment_cancelled') {
          if (result.error.code !== 'payment_cancelled') {
            reportUserError(checkoutLogger, 'purchase_checkout_prepare_failed', result.error, result.error.message);
          }
          patchPurchase({ paymentStatus: 'idle', checkoutReady: false });
          if (result.error.code === 'promo_invalid') {
            patchPurchase({
              promoApplied: false,
              promoInvalid: true,
              promoCode: session.purchase?.promoCode ?? null,
            });
            void navigate(purchaseJourneyPaths.orderSummaryInvalidPromo, { replace: true });
            return;
          }
          void navigate(
            getOrderSummaryPath(session.purchase?.promoApplied, session.purchase?.promoInvalid),
            { replace: true },
          );
          return;
        }

        reportUserError(checkoutLogger, 'purchase_payment_failed', result.error, result.error.message);
        patchPurchase({ paymentStatus: 'failed' });
        void navigate(purchaseJourneyPaths.paymentFailed);
        return;
      }

      if (
        result.paymentStatus === 'success' ||
        result.paymentStatus === 'failed' ||
        result.paymentStatus === 'unconfirmed' ||
        result.paymentStatus === 'confirming'
      ) {
        patchPaymentOutcome(patchPurchase, navigate, result.paymentStatus);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [
    executePayment,
    navigate,
    patchPurchase,
    planId,
    purchase?.paymentStatus,
    riderCount,
    session.purchase,
    session.purchase?.paymentStatus,
  ]);

  return <R09ProcessingPaymentScreen />;
}

function PaymentStillConfirmingRoute() {
  const navigate = useNavigate();
  const { session, purchase, patchPurchase } = usePurchaseCheckout();
  const { pollPaymentStatus } = usePaymentPolling();
  const orderId = peekOrderId();

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (shouldLeavePaymentScreen(session.purchase, ['confirming', 'unconfirmed', 'success', 'failed'])) {
      void navigate(getOrderSummaryPath(session.purchase?.promoApplied, session.purchase?.promoInvalid), {
        replace: true,
      });
    }
  }, [
    navigate,
    purchase,
    session.purchase?.paymentStatus,
    session.purchase?.promoApplied,
    session.purchase?.promoInvalid,
  ]);

  useEffect(() => {
    if (session.purchase?.paymentStatus !== 'confirming' || !orderId) {
      return;
    }

    const abortController = new AbortController();

    void (async () => {
      const result = await pollPaymentStatus(orderId);

      if (abortController.signal.aborted) {
        return;
      }

      if (!result.ok) {
        reportUserError(checkoutLogger, 'purchase_payment_poll_failed', result.error, result.error.message);
        return;
      }

      if (
        result.paymentStatus === 'success' ||
        result.paymentStatus === 'failed' ||
        result.paymentStatus === 'unconfirmed'
      ) {
        patchPaymentOutcome(patchPurchase, navigate, result.paymentStatus);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [navigate, orderId, patchPurchase, pollPaymentStatus, session.purchase?.paymentStatus]);

  return <R09bStillConfirmingScreen />;
}

function PaymentSuccessRoute() {
  const navigate = useNavigate();
  const { setPhase, session, updateSession } = useJourney();
  const { planId, purchase } = usePurchaseCheckout();
  const vehiclesSyncedRef = useRef(false);
  const paidAmountInr = purchase?.paidAmountInr ?? 0;

  useEffect(() => {
    if (session.purchase?.paymentStatus !== 'success') {
      void navigate(getOrderSummaryPath(session.purchase?.promoApplied, session.purchase?.promoInvalid), {
        replace: true,
      });
    }
  }, [
    navigate,
    session.purchase?.paymentStatus,
    session.purchase?.promoApplied,
    session.purchase?.promoInvalid,
  ]);

  useEffect(() => {
    if (session.purchase?.paymentStatus !== 'success' || vehiclesSyncedRef.current) {
      return;
    }
    vehiclesSyncedRef.current = true;
    void syncVehiclesAfterPayment().then((result) => {
      if (!result.ok) {
        reportUserError(vehicleLogger, 'purchase_vehicle_sync_failed', result.error, result.error.message);
      }
    });
  }, [session.purchase?.paymentStatus]);

  return (
    <R10PaymentSuccessScreen
      selectedPlanId={planId}
      paidAmountInr={paidAmountInr}
      onContinue={() => {
        setPhase('emergency');
        const purchaseSession = session.purchase ?? {};
        updateSession({
          emergency: {
            ...session.emergency,
            riderSkipped: false,
          },
          purchase: {
            ...purchaseSession,
            riderCount:
              purchaseSession.riderCount ??
              (purchaseSession.selectedPlanId ? 1 : 0),
          },
        });
        void navigate(getPurchasePostPaymentEmergencyPath(), { replace: true });
      }}
    />
  );
}

function PaymentFailedRoute() {
  const navigate = useNavigate();
  const { session, patchPurchase } = usePurchaseCheckout();
  const orderSummaryPath = getOrderSummaryPath(
    session.purchase?.promoApplied,
    session.purchase?.promoInvalid,
  );

  useEffect(() => {
    if (session.purchase?.paymentStatus !== 'failed') {
      void navigate(orderSummaryPath, {
        replace: true,
      });
    }
  }, [
    navigate,
    orderSummaryPath,
    session.purchase?.paymentStatus,
  ]);

  return (
    <R10bPaymentFailedScreen
      onBack={() => {
        resetCheckoutForRetry();
        patchPurchase({
          checkoutReady: false,
          paymentStatus: 'idle',
        });
        void navigate(orderSummaryPath);
      }}
      onRetry={() => {
        resetCheckoutForRetry();
        patchPurchase({
          checkoutReady: false,
          paymentStatus: 'idle',
        });
        void navigate(orderSummaryPath);
      }}
    />
  );
}

function PaymentUnconfirmedRoute() {
  const navigate = useNavigate();
  const { session, patchPurchase } = usePurchaseCheckout();
  const { pollPayment } = useCheckout();
  const orderId = peekOrderId();

  useEffect(() => {
    if (shouldLeavePaymentScreen(session.purchase, ['unconfirmed', 'success', 'failed'])) {
      void navigate(getOrderSummaryPath(session.purchase?.promoApplied, session.purchase?.promoInvalid), {
        replace: true,
      });
    }
  }, [
    navigate,
    session.purchase?.paymentStatus,
    session.purchase?.promoApplied,
    session.purchase?.promoInvalid,
  ]);

  return (
    <R10cPaymentUnconfirmedScreen
      onBack={() => {
        patchPurchase({ paymentStatus: 'processing' });
        void navigate(purchaseJourneyPaths.processingPayment);
      }}
      onCheckStatus={() => {
        if (!orderId) {
          return;
        }
        void (async () => {
          const result = await pollPayment(orderId);
          if (!result.ok) {
            reportUserError(checkoutLogger, 'purchase_payment_status_failed', result.error, result.error.message);
            return;
          }
          if (
            result.paymentStatus === 'success' ||
            result.paymentStatus === 'failed' ||
            result.paymentStatus === 'unconfirmed'
          ) {
            patchPaymentOutcome(patchPurchase, navigate, result.paymentStatus);
          }
        })();
      }}
    />
  );
}

export function PurchaseRoutes() {
  return (
    <PurchaseSegmentBootstrap>
      <Routes>
        <Route index element={<PurchaseIndexRedirect />} />
        <Route
          path={PURCHASE_ROUTE_SEGMENTS.vehicleDetails}
          element={
            <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleDetails}>
              <VehicleDetailsRoute />
            </PurchaseRouteGate>
          }
        />
        <Route
          path={PURCHASE_ROUTE_SEGMENTS.vehicleLookup}
          element={
            <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleLookup}>
              <VehicleLookupRoute />
            </PurchaseRouteGate>
          }
        />
        <Route
          path={PURCHASE_ROUTE_SEGMENTS.vehicleLookupFailed}
          element={
            <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleLookupFailed}>
              <VehicleLookupFailedRoute />
            </PurchaseRouteGate>
          }
        />
        <Route
          path={PURCHASE_ROUTE_SEGMENTS.vehicleConfirmation}
          element={
            <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleConfirmation}>
              <VehicleConfirmationRoute />
            </PurchaseRouteGate>
          }
        />
        <Route
          path={PURCHASE_ROUTE_SEGMENTS.choosePlan}
          element={
            <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.choosePlan}>
              <ChoosePlanRoute />
            </PurchaseRouteGate>
          }
        />
        <Route
          path={PURCHASE_ROUTE_SEGMENTS.riderCover}
          element={
            <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.riderCover}>
              <RiderCoverRoute />
            </PurchaseRouteGate>
          }
        />
        <Route
          path={PURCHASE_ROUTE_SEGMENTS.orderSummary}
          element={
            <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.orderSummary}>
              <OrderSummaryRoute />
            </PurchaseRouteGate>
          }
        />
        <Route path={PURCHASE_ROUTE_SEGMENTS.orderSummaryPromoApplied} element={<OrderSummaryPromoAppliedRoute />} />
        <Route path={PURCHASE_ROUTE_SEGMENTS.orderSummaryInvalidPromo} element={<OrderSummaryInvalidPromoRoute />} />
        <Route path={PURCHASE_ROUTE_SEGMENTS.processingPayment} element={<ProcessingPaymentRoute />} />
        <Route path={PURCHASE_ROUTE_SEGMENTS.paymentStillConfirming} element={<PaymentStillConfirmingRoute />} />
        <Route path={PURCHASE_ROUTE_SEGMENTS.paymentSuccess} element={<PaymentSuccessRoute />} />
        <Route path={PURCHASE_ROUTE_SEGMENTS.paymentFailed} element={<PaymentFailedRoute />} />
        <Route path={PURCHASE_ROUTE_SEGMENTS.paymentUnconfirmed} element={<PaymentUnconfirmedRoute />} />
        {legacyPurchasePathRedirects.map(([legacySegment, canonicalPath]) => (
          <Route
            key={legacySegment}
            path={legacySegment}
            element={<Navigate to={canonicalPath} replace />}
          />
        ))}
        <Route path="*" element={<PurchaseIndexRedirect />} />
      </Routes>
    </PurchaseSegmentBootstrap>
  );
}

export { purchaseJourneyPaths };
