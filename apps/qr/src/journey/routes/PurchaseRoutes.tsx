import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { usePurchaseRouteHydration, PurchaseRouteHydrationProvider } from '../../hooks/purchase/usePurchaseRouteHydration';
import { AlScreenBg, AlScreenSpinner, formatPlateInput } from '@autolokate/ui';

import {
  isPlateEntryReady,
  normalizePlate,
} from '../../services/vehicle/index';
import { compactPlate } from '@/services/vehicle/vehicle-plate';
import { useVehicleLookup } from '../../hooks/vehicle/index';
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
} from '../../features/qr-purchase/screens/index';
import type { PurchaseVehiclePlateState } from '../../features/qr-purchase/types-vehicle';
import type {
  PurchasePlanId,
  PurchaseRiderCount,
} from '../../features/qr-purchase/types-checkout';
import { DEFAULT_PURCHASE_PLAN_ID } from '../../features/qr-purchase/data/purchase-plans';
import { getVehicle } from '@/storage/index';
import { buildOrderSummary } from '../../features/qr-purchase/data/purchase-pricing';
import { normalizePromoCode } from '../../features/qr-purchase/data/purchase-promo';
import { usePlans } from '../../hooks/plan/index';
import { getRiderOptionsForPlan, isPlanRiderEligible } from '@/services/plan/plan-mapper';
import { getPurchasePlansCatalog } from '@/services/plan/plan-service';
import { useCheckout } from '../../hooks/checkout/index';
import { usePaymentPolling } from '../../hooks/checkout/index';
import { useCartPricing } from '../../hooks/checkout/index';
import { useQrAttach } from '../../hooks/qr/index';
import { getStoredPurchaseQrResolve, resolveQrCode } from '@/services/qr/qr-service';
import {
  getCheckoutSummary,
  peekOrderId,
  resetCheckoutForRetry,
  type CheckoutParams,
} from '../../services/checkout/index';
import { openOrderInvoice, resolveCheckoutOrderId } from '@/services/checkout/invoice-service';
import { syncVehiclesAfterPayment } from '@/services/vehicle/vehicle-sync-service';
import { persistQrCodeFromUrl } from '@/platform/qr/qr-code-from-url';
import { usePreventBrowserBack } from '@/platform/navigation/use-prevent-browser-back';
import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';
import { reportUserError } from '@/platform/feedback/index';
import { getPurchasePostPaymentEmergencyPath } from '../activation-routing';
import { persistPurchaseSelections, persistVehicleContext } from '@/services/purchase/purchase-context-service';
import { checkoutLogger } from '@/services/checkout/checkout-logger';
import { resolveOrderQrCode } from '@/services/checkout/resolve-order-qr-code';
import { clearPromoPreviewCache, validatePromoCheckout } from '@/services/promo/index';
import { promoLogger } from '@/services/promo/promo-logger';
import { planLogger } from '@/services/plan/plan-logger';
import { resetAttachAttemptCache } from '@/services/qr/qr-attach-service';
import {
  PURCHASE_ROUTE_ID,
} from '@/journey/state/purchase-journey-state-machine';
import { PurchaseRouteGate } from '../guards/PurchaseRouteGate';
import { PurchaseIndexRedirect } from '../guards/PurchaseIndexRedirect';
import { qrAttachLogger } from '@/services/qr/qr-attach-logger';
import { qrLogger } from '@/services/qr/qr-logger';
import { vehicleLogger } from '@/services/vehicle/vehicle-logger';
import { getAuthFlowBackPath } from '../activation-routing';
import { useActiveJourneyId } from '../routing/use-active-journey-id';
import { useJourney } from '../JourneyContext';
import { hasAuthTokens } from '@/services/auth/ensure-valid-auth-session';
import {
  purchaseJourneyPaths,
  legacyPurchasePathRedirectsForActiveJourney,
  purchaseVehicleConfirmationPath,
  purchaseVehicleLookupPath,
} from '../purchase/purchase-paths-runtime';
import {
  parsePurchaseVehicleConfirmationPath,
  parsePurchaseVehicleLookupPath,
  PURCHASE_ROUTE_SEGMENTS,
} from '../purchase/purchase-routing';
import { stripOnboardingPrefix } from '../routing/journey-url-routing';

function PurchaseRouteLoader({ label = 'Loading order' }: { label?: string }) {
  return (
    <AlScreenBg variant="protected" className="qr-route-loader">
      <AlScreenSpinner size="lg" animated aria-label={label} />
    </AlScreenBg>
  );
}

function PurchaseSegmentBootstrap({ children }: { children: ReactNode }) {
  const { setPhase } = useJourney();
  const { isHydrating, plansReady } = usePurchaseRouteHydration();

  useEffect(() => {
    setPhase('activation');
  }, [setPhase]);

  if (isHydrating && !plansReady) {
    return <PurchaseRouteLoader />;
  }

  return children;
}

function usePurchaseCheckout() {
  const { session, updateSession } = useJourney();
  const purchase = session.purchase;
  const storedVehicle = getVehicle();
  const planId =
    purchase?.selectedPlanId ?? storedVehicle?.selectedPlanId ?? DEFAULT_PURCHASE_PLAN_ID;
  const riderCount = purchase?.riderCount ?? storedVehicle?.riderCount ?? 1;

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

async function applyPromoCode(
  code: string,
  params: {
    planId: PurchasePlanId;
    riderCount: PurchaseRiderCount;
  },
  patchPurchase: ReturnType<typeof usePurchaseCheckout>['patchPurchase'],
  navigate: ReturnType<typeof useNavigate>,
): Promise<void> {
  const normalized = normalizePromoCode(code);
  if (!normalized) {
    return;
  }

  const purchaseQrCode = resolveOrderQrCode();
  if (!purchaseQrCode) {
    reportUserError(
      qrLogger,
      'promo_validate_missing_qr',
      new Error('missing_purchase_qr_code'),
      'Your purchase QR code is missing. Scan your Autolokate sticker or open your purchase link again.',
    );
    return;
  }

  const result = await validatePromoCheckout({
    purchaseQrCode,
    planId: params.planId,
    riderCount: params.riderCount,
    promoCode: normalized,
  });

  if (!result.ok) {
    if (result.error.code === 'promo_invalid') {
      patchPurchase({
        promoApplied: false,
        promoInvalid: true,
        promoCode: normalized,
      });
      void navigate(purchaseJourneyPaths.orderSummaryInvalidPromo);
      return;
    }

    reportUserError(promoLogger, 'promo_validate_failed', result.error, result.error.message);
    return;
  }

  patchPurchase({
    promoApplied: true,
    promoCode: result.promoCode,
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

  const summary =
    getCheckoutSummary() ??
    buildOrderSummary({
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { session, updateSession, selectedFlow } = useJourney();
  const journeyId = useActiveJourneyId();
  const { purchase } = usePurchaseCheckout();
  const vehicle = session.vehicle ?? {};

  const blockedMessage =
    typeof (location.state as { vehicleBlockedMessage?: unknown } | null)?.vehicleBlockedMessage ===
    'string'
      ? (location.state as { vehicleBlockedMessage: string }).vehicleBlockedMessage
      : null;

  const [plate, setPlate] = useState(() => formatPlateInput(vehicle.plate ?? ''));
  const [plateState, setPlateState] = useState<PurchaseVehiclePlateState>(() => {
    if (blockedMessage) {
      return 'error';
    }
    if (vehicle.fetchStatus === 'not-found') {
      return 'error';
    }
    if (vehicle.plate?.trim()) {
      return 'filled';
    }
    return 'empty';
  });
  const [plateErrorMessage, setPlateErrorMessage] = useState<string | undefined>(() =>
    blockedMessage ?? undefined,
  );

  useEffect(() => {
    if (!blockedMessage) {
      return;
    }
    setPlateState('error');
    setPlateErrorMessage(blockedMessage);
    // Clear one-shot navigation state so refresh doesn't keep the attach error.
    void navigate(location.pathname + location.search, { replace: true, state: null });
  }, [blockedMessage, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (vehicle.fetchStatus === 'not-found' && !plateErrorMessage) {
      setPlateState('error');
    }
  }, [plateErrorMessage, vehicle.fetchStatus]);

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  useEffect(() => {
    persistQrCodeFromUrl(searchParams);
    const stored = getStoredPurchaseQrResolve();
    if (stored.ok) {
      return;
    }

    const code = resolvePurchaseQrCode(searchParams);
    if (!code) {
      reportUserError(qrLogger, 'purchase_resolve_missing', stored.error, stored.error.message);
      return;
    }

    void resolveQrCode(code).then((result) => {
      if (!result.ok) {
        reportUserError(qrLogger, 'purchase_resolve_refresh_failed', result.error, result.error.message);
      }
    });
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
      setPlateErrorMessage(undefined);
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
    setPlateErrorMessage(undefined);
    void navigate(purchaseVehicleLookupPath(normalized));
  }, [navigate, plate, updateSession, vehicle]);

  return (
    <R03VehicleNumberScreen
      plateValue={plate}
      plateState={plateState}
      plateErrorMessage={plateErrorMessage}
      onPlateChange={(value) => {
        setPlate(value);
        if (plateState === 'error') {
          setPlateState(value.trim() ? 'filled' : 'empty');
          setPlateErrorMessage(undefined);
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
        // Logged-in users must not re-enter /auth via /q bootstrap.
        if (hasAuthTokens()) {
          return;
        }
        void navigate(getAuthFlowBackPath(selectedFlow, journeyId ?? undefined), { replace: true });
      }}
      showBack={!hasAuthTokens()}
      onContinue={handleFetch}
    />
  );
}

function VehicleLookupRoute({ registrationNumber }: { registrationNumber: string }) {
  const navigate = useNavigate();
  const { session, updateSession } = useJourney();
  const { purchase } = usePurchaseCheckout();
  const { lookupVehicle } = useVehicleLookup();
  const plate = session.vehicle?.plate ?? registrationNumber;

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!plate) {
      void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
      return;
    }

    if (compactPlate(normalizePlate(plate)) !== compactPlate(normalizePlate(registrationNumber))) {
      void navigate(purchaseVehicleLookupPath(plate), { replace: true });
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
        void navigate(purchaseVehicleConfirmationPath(result.plate), { replace: true });
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
  }, [lookupVehicle, navigate, plate, purchase, registrationNumber, updateSession]);

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

function VehicleConfirmationRoute({ registrationNumber }: { registrationNumber: string }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, updateSession } = useJourney();
  const { purchase } = usePurchaseCheckout();
  const { attachPurchaseQr, isPending: isAttachPending } = useQrAttach();
  const vehicle = session.vehicle ?? {};
  const attachStartedRef = useRef(false);

  const proceedToChoosePlan = useCallback(() => {
    persistVehicleContext({
      registration: vehicle.plate ?? '',
      fields: vehicle.fields,
      ownerName: session.auth?.ownerName,
      languageId: session.auth?.languageId,
      selectedPlanId: DEFAULT_PURCHASE_PLAN_ID,
      riderCount: 1,
    });

    flushSync(() => {
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
    });
    void navigate(purchaseJourneyPaths.choosePlan, { replace: true });
  }, [
    navigate,
    session.auth?.languageId,
    session.auth?.ownerName,
    updateSession,
    vehicle,
  ]);

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!vehicle.plate || vehicle.fetchStatus !== 'success' || !vehicle.fields?.length) {
      void navigate(purchaseJourneyPaths.vehicleDetails, { replace: true });
      return;
    }
    if (compactPlate(normalizePlate(vehicle.plate)) !== compactPlate(normalizePlate(registrationNumber))) {
      void navigate(purchaseVehicleConfirmationPath(vehicle.plate), { replace: true });
    }
  }, [navigate, purchase, registrationNumber, vehicle.fields, vehicle.fetchStatus, vehicle.plate]);

  const runAttach = useCallback(() => {
    if (isAttachPending || attachStartedRef.current) {
      return;
    }
    attachStartedRef.current = true;

    void (async () => {
      // Persist plate before attach — attach reads registration from purchase storage.
      persistVehicleContext({
        registration: vehicle.plate ?? '',
        fields: vehicle.fields,
        ownerName: session.auth?.ownerName,
        languageId: session.auth?.languageId,
        selectedPlanId: DEFAULT_PURCHASE_PLAN_ID,
        riderCount: 1,
      });

      try {
        const result = await attachPurchaseQr(searchParams, { force: true });
        if (!result.ok) {
          attachStartedRef.current = false;
          resetAttachAttemptCache();
          if (result.error.code === 'vehicle_already_subscribed') {
            reportUserError(
              qrAttachLogger,
              'purchase_attach_vehicle_already_subscribed',
              result.error,
              result.error.message,
            );
            flushSync(() => {
              updateSession({
                vehicle: {
                  ...vehicle,
                  confirmed: false,
                  fetchStatus: 'idle',
                },
              });
            });
            void navigate(purchaseJourneyPaths.vehicleDetails, {
              replace: true,
              state: {
                vehicleBlockedMessage:
                  result.error.message ||
                  'This vehicle already has an active protection plan. Enter a different number and try again.',
              },
            });
            return;
          }

          reportUserError(
            qrAttachLogger,
            'purchase_attach_failed',
            result.error,
            result.error.message,
          );
          return;
        }
        proceedToChoosePlan();
      } catch (error: unknown) {
        attachStartedRef.current = false;
        resetAttachAttemptCache();
        reportUserError(qrAttachLogger, 'purchase_attach_error', error);
      }
    })();
  }, [
    attachPurchaseQr,
    isAttachPending,
    navigate,
    proceedToChoosePlan,
    searchParams,
    session.auth?.languageId,
    session.auth?.ownerName,
    updateSession,
    vehicle,
  ]);

  return (
    <R05ConfirmVehicleScreen
      plate={vehicle.plate}
      fields={vehicle.fields}
      footerLoading={isAttachPending}
      footerLabel={isAttachPending ? 'Linking…' : 'Looks right'}
      onBack={() => {
        void navigate(purchaseJourneyPaths.vehicleDetails);
      }}
      onContinue={runAttach}
    />
  );
}

function ChoosePlanRoute() {
  const navigate = useNavigate();
  const { session, planId, patchPurchase, purchase } = usePurchaseCheckout();
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
        const plate = session.vehicle?.plate;
        if (plate?.trim()) {
          void navigate(purchaseVehicleConfirmationPath(plate));
        } else {
          void navigate(purchaseJourneyPaths.vehicleDetails);
        }
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
  const { planId, riderCount, purchase, patchPurchase } = usePurchaseCheckout();
  const { plansRevision, plansReady } = usePurchaseRouteHydration();
  const checkoutParams = buildCheckoutParams(planId, riderCount, {
    ...purchase,
    promoApplied: false,
    promoCode: null,
  });
  const { cartReady, cartRevision } = useCartPricing(checkoutParams);
  const [promoInput, setPromoInput] = useState(purchase?.promoCode ?? '');
  const [promoApplying, setPromoApplying] = useState(false);

  useEffect(() => {
    redirectIfPaymentSucceeded(navigate, purchase);
  }, [navigate, purchase]);

  if (!plansReady || !cartReady) {
    return <PurchaseRouteLoader />;
  }

  return (
    <R08OrderSummaryScreen
      key={`${plansRevision}-${cartRevision}`}
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoInput}
      onPromoCodeChange={setPromoInput}
      isApplyingPromo={promoApplying}
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
  const checkoutParams = buildCheckoutParams(planId, riderCount, {
    ...purchase,
    promoApplied: false,
    promoCode: null,
  });
  const { cartReady, cartRevision } = useCartPricing(checkoutParams);
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

  if (!cartReady) {
    return <PurchaseRouteLoader />;
  }

  return (
    <R08cInvalidPromoScreen
      key={cartRevision}
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoInput}
      isApplyingPromo={promoApplying}
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
  const promoCode = purchase?.promoCode ?? '';
  const checkoutParams = buildCheckoutParams(planId, riderCount, purchase);
  const { cartReady, cartRevision } = useCartPricing(checkoutParams);

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!session.purchase?.promoApplied || !session.purchase.promoCode) {
      void navigate(getOrderSummaryPath(false, session.purchase?.promoInvalid), { replace: true });
    }
  }, [navigate, purchase, session.purchase?.promoApplied, session.purchase?.promoCode, session.purchase?.promoInvalid]);

  if (!cartReady) {
    return <PurchaseRouteLoader />;
  }

  return (
    <R08bPromoAppliedScreen
      key={cartRevision}
      selectedPlanId={planId}
      riderCount={riderCount}
      promoCode={promoCode}
      onRemovePromo={() => {
        if (purchase?.paymentStatus === 'success') {
          redirectIfPaymentSucceeded(navigate, purchase);
          return;
        }
        clearPromoPreviewCache();
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
          promoCode: purchase?.promoCode ?? null,
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
          if (result.error.code === 'cart_stale' || result.error.code === 'catalog_stale') {
            resetCheckoutForRetry();
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
  const [invoiceDownloading, setInvoiceDownloading] = useState(false);
  const paidAmountInr = purchase?.paidAmountInr ?? 0;
  const orderId = resolveCheckoutOrderId();

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

  usePreventBrowserBack(session.purchase?.paymentStatus === 'success');

  return (
    <R10PaymentSuccessScreen
      selectedPlanId={planId}
      paidAmountInr={paidAmountInr}
      invoiceDownloading={invoiceDownloading}
      onDownloadInvoice={
        orderId
          ? () => {
              setInvoiceDownloading(true);
              void openOrderInvoice(orderId)
                .then((opened) => {
                  if (!opened) {
                    reportUserError(
                      checkoutLogger,
                      'order_invoice_open_failed',
                      new Error('invoice_unavailable'),
                      'Tax invoice is not available yet. Try again in a moment.',
                    );
                  }
                })
                .finally(() => {
                  setInvoiceDownloading(false);
                });
            }
          : undefined
      }
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

function resolvePurchaseRouteContent(pathname: string): ReactNode {
  const path = stripOnboardingPrefix(pathname).replace(/\/+$/, '') || '/';

  for (const [legacySegment, canonicalPath] of legacyPurchasePathRedirectsForActiveJourney()) {
    if (path === `/${legacySegment}`) {
      return <Navigate to={canonicalPath} replace />;
    }
  }

  const lookupRegistration = parsePurchaseVehicleLookupPath(path);
  if (lookupRegistration) {
    return (
      <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleLookup}>
        <VehicleLookupRoute registrationNumber={lookupRegistration} />
      </PurchaseRouteGate>
    );
  }

  const confirmationRegistration = parsePurchaseVehicleConfirmationPath(path);
  if (confirmationRegistration) {
    return (
      <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleConfirmation}>
        <VehicleConfirmationRoute registrationNumber={confirmationRegistration} />
      </PurchaseRouteGate>
    );
  }

  switch (path) {
    case `/${PURCHASE_ROUTE_SEGMENTS.vehicleDetails}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleDetails}>
          <VehicleDetailsRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.vehicleLookupFailed}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.vehicleLookupFailed}>
          <VehicleLookupFailedRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.choosePlan}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.choosePlan}>
          <ChoosePlanRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.riderCover}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.riderCover}>
          <RiderCoverRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.orderSummary}`:
      return (
        <PurchaseRouteGate routeId={PURCHASE_ROUTE_ID.orderSummary}>
          <OrderSummaryRoute />
        </PurchaseRouteGate>
      );
    case `/${PURCHASE_ROUTE_SEGMENTS.orderSummaryPromoApplied}`:
      return <OrderSummaryPromoAppliedRoute />;
    case `/${PURCHASE_ROUTE_SEGMENTS.orderSummaryInvalidPromo}`:
      return <OrderSummaryInvalidPromoRoute />;
    case `/${PURCHASE_ROUTE_SEGMENTS.processingPayment}`:
      return <ProcessingPaymentRoute />;
    case `/${PURCHASE_ROUTE_SEGMENTS.paymentStillConfirming}`:
      return <PaymentStillConfirmingRoute />;
    case `/${PURCHASE_ROUTE_SEGMENTS.paymentSuccess}`:
      return <PaymentSuccessRoute />;
    case `/${PURCHASE_ROUTE_SEGMENTS.paymentFailed}`:
      return <PaymentFailedRoute />;
    case `/${PURCHASE_ROUTE_SEGMENTS.paymentUnconfirmed}`:
      return <PaymentUnconfirmedRoute />;
    default:
      return <PurchaseIndexRedirect />;
  }
}

export function PurchaseRoutes() {
  const { pathname } = useLocation();

  return (
    <PurchaseRouteHydrationProvider>
      <PurchaseSegmentBootstrap>
        {resolvePurchaseRouteContent(pathname)}
      </PurchaseSegmentBootstrap>
    </PurchaseRouteHydrationProvider>
  );
}

export { purchaseJourneyPaths };
