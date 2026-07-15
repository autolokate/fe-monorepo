import { useCallback, useEffect, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import type { NavigateFunction } from 'react-router-dom';

import { usePurchaseRouteHydration } from '../../../hooks/purchase/usePurchaseRouteHydration';
import { PurchaseRouteError } from '@/components/compositions/purchase-route-error/index';
import { AlScreenBg, AlScreenSpinner } from '@autolokate/ui';

import type {
  PurchasePlanId,
  PurchaseRiderCount,
} from '../../../features/qr-purchase/types-checkout';
import { DEFAULT_PURCHASE_PLAN_ID } from '../../../features/qr-purchase/data/purchase-plans';
import { getVehicle } from '@/storage/index';
import { buildOrderSummary } from '../../../features/qr-purchase/data/purchase-pricing';
import { normalizePromoCode } from '../../../features/qr-purchase/data/purchase-promo';
import { getCheckoutSummary, type CheckoutParams } from '../../../services/checkout/index';
import { reportUserError } from '@/platform/feedback/index';
import { purchaseJourneyPaths } from '../../purchase/purchase-paths-runtime';
import { useJourney } from '../../JourneyContext';
import type { JourneySession } from '../../types';
import { resolveOrderQrCode } from '@/services/checkout/resolve-order-qr-code';
import { validatePromoCheckout } from '@/services/promo/index';
import { promoLogger } from '@/services/promo/promo-logger';
import { qrLogger } from '@/services/qr/qr-logger';
import { resetProcessingPaymentAttempt } from './processing-payment-attempt';

type PurchaseSessionPatch = Partial<NonNullable<JourneySession['purchase']>>;

export function PurchaseRouteLoader({ label = 'Loading order' }: { label?: string }) {
  return (
    <AlScreenBg variant="protected" className="qr-route-loader">
      <AlScreenSpinner size="lg" animated aria-label={label} />
    </AlScreenBg>
  );
}

export function PurchaseSegmentBootstrap({ children }: { children: ReactNode }) {
  const { setPhase } = useJourney();
  const { isHydrating, plansReady, hydrationError, retryHydration } = usePurchaseRouteHydration();

  useEffect(() => {
    setPhase('activation');
  }, [setPhase]);

  if (isHydrating && !plansReady) {
    return <PurchaseRouteLoader label="Loading plans" />;
  }

  if (hydrationError && !plansReady) {
    return <PurchaseRouteError message={hydrationError} onRetry={retryHydration} />;
  }

  return children;
}

export function usePurchaseCheckout() {
  const { session, updateSession } = useJourney();
  const purchase = session.purchase;
  const storedVehicle = getVehicle();
  const planId =
    purchase?.selectedPlanId ?? storedVehicle?.selectedPlanId ?? DEFAULT_PURCHASE_PLAN_ID;
  const riderCount = purchase?.riderCount ?? storedVehicle?.riderCount ?? 1;

  const patchPurchase = useCallback(
    (patch: PurchaseSessionPatch) => {
      // JourneyContext deep-merges `purchase` against latest persisted state.
      updateSession({ purchase: patch });
    },
    [updateSession],
  );

  return { session, purchase, planId, riderCount, patchPurchase, updateSession };
}

export function getOrderSummaryPath(promoApplied?: boolean, promoInvalid?: boolean) {
  if (promoInvalid) {
    return purchaseJourneyPaths.orderSummaryInvalidPromo;
  }
  return promoApplied
    ? purchaseJourneyPaths.orderSummaryPromoApplied
    : purchaseJourneyPaths.orderSummary;
}

/** After payment success, resume at R10 until the user continues to emergency. */
export function getPostPaymentSuccessPath(): string {
  return purchaseJourneyPaths.paymentSuccess;
}

export function getPostPaymentResumePath(
  purchase: ReturnType<typeof usePurchaseCheckout>['purchase'],
): string | null {
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

export function redirectIfPaymentSucceeded(
  navigate: NavigateFunction,
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
export function shouldLeavePaymentScreen(
  current: ReturnType<typeof usePurchaseCheckout>['purchase'] | undefined,
  allowed: Array<NonNullable<ReturnType<typeof usePurchaseCheckout>['purchase']>['paymentStatus']>,
): boolean {
  const status = current?.paymentStatus;
  if (!status) {
    return true;
  }
  return !allowed.includes(status);
}

export function buildCheckoutParams(
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

export function patchPaymentOutcome(
  patchPurchase: ReturnType<typeof usePurchaseCheckout>['patchPurchase'],
  navigate: NavigateFunction,
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

export async function applyPromoCode(
  code: string,
  params: {
    planId: PurchasePlanId;
    riderCount: PurchaseRiderCount;
  },
  patchPurchase: ReturnType<typeof usePurchaseCheckout>['patchPurchase'],
  navigate: NavigateFunction,
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

export function startPayment(
  patchPurchase: ReturnType<typeof usePurchaseCheckout>['patchPurchase'],
  navigate: NavigateFunction,
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
    // Reset attempt lock before flipping to processing so StrictMode remount can share one run,
    // and a user retry after cancel always starts a new attempt.
    resetProcessingPaymentAttempt();
    patchPurchase({
      selectedPlanId: params.planId,
      riderCount: params.riderCount,
      promoApplied: params.promoApplied,
      promoCode: params.promoCode ?? null,
      checkoutReady: true,
      paymentStatus: 'processing',
      paidAmountInr: summary.totalInr,
    });
  });

  void navigate(purchaseJourneyPaths.processingPayment);
}
