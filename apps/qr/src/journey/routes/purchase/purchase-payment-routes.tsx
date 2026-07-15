import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  R09ProcessingPaymentScreen,
  R09bStillConfirmingScreen,
  R10PaymentSuccessScreen,
  R10bPaymentFailedScreen,
  R10cPaymentUnconfirmedScreen,
} from '../../../features/qr-purchase/screens/index';
import { useCheckout } from '../../../hooks/checkout/index';
import { usePaymentPolling } from '../../../hooks/checkout/index';
import { resetCheckoutForRetry } from '../../../services/checkout/index';
import {
  openOrderInvoice,
  prefetchOrderInvoice,
  resolveCheckoutOrderId,
} from '@/services/checkout/invoice-service';
import { syncVehiclesAfterPayment } from '@/services/vehicle/vehicle-sync-service';
import { usePreventBrowserBack } from '@/platform/navigation/use-prevent-browser-back';
import { reportUserError } from '@/platform/feedback/index';
import { checkoutLogger } from '@/services/checkout/checkout-logger';
import { vehicleLogger } from '@/services/vehicle/vehicle-logger';
import { useQrAttach } from '../../../hooks/qr/index';
import { getEmergencyHandoffPath } from '../../activation-routing';
import { persistVehicleContext } from '@/services/purchase/purchase-context-service';
import { resetAttachAttemptCache } from '@/services/qr/qr-attach-service';
import { qrAttachLogger } from '@/services/qr/qr-attach-logger';
import { useJourney } from '../../JourneyContext';
import { purchaseJourneyPaths } from '../../purchase/purchase-paths-runtime';
import {
  buildCheckoutParams,
  getOrderSummaryPath,
  patchPaymentOutcome,
  redirectIfPaymentSucceeded,
  shouldLeavePaymentScreen,
  usePurchaseCheckout,
} from './purchase-route-shared';
import {
  getProcessingPaymentAttemptKey,
  resetProcessingPaymentAttempt,
  setProcessingPaymentAttemptKey,
} from './processing-payment-attempt';

export function ProcessingPaymentRoute() {
  const navigate = useNavigate();
  const { planId, riderCount, purchase, patchPurchase } = usePurchaseCheckout();
  const { executePayment } = usePaymentPolling();
  const paymentStatus = purchase?.paymentStatus;
  const checkoutReady = Boolean(purchase?.checkoutReady);
  const promoApplied = purchase?.promoApplied;
  const promoInvalid = purchase?.promoInvalid;
  const promoCode = purchase?.promoCode;

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (!checkoutReady || shouldLeavePaymentScreen(purchase, ['processing', 'confirming'])) {
      void navigate(getOrderSummaryPath(promoApplied, promoInvalid), {
        replace: true,
      });
    }
  }, [checkoutReady, navigate, promoApplied, promoInvalid, purchase, paymentStatus]);

  useEffect(() => {
    if (paymentStatus !== 'processing' || !checkoutReady) {
      return;
    }

    const attemptKey = `${planId}:${String(riderCount)}:${promoApplied ? '1' : '0'}:${promoCode ?? ''}:${String(purchase?.paidAmountInr ?? 0)}`;
    if (getProcessingPaymentAttemptKey() === attemptKey) {
      return;
    }
    setProcessingPaymentAttemptKey(attemptKey);

    void (async () => {
      const result = await executePayment(
        buildCheckoutParams(planId, riderCount, {
          promoApplied,
          promoCode,
        }),
      );

      if (getProcessingPaymentAttemptKey() !== attemptKey) {
        return;
      }

      if (!result.ok) {
        resetProcessingPaymentAttempt();
        if (result.phase === 'prepare' || result.error.code === 'payment_cancelled') {
          if (result.error.code !== 'payment_cancelled') {
            // Always snackbar order/cart prepare failures (mapped CheckoutError is not an ApiError).
            reportUserError(
              checkoutLogger,
              'purchase_checkout_prepare_failed',
              result.error,
              result.error.message,
              { toast: true },
            );
          }
          patchPurchase({ paymentStatus: 'idle', checkoutReady: false });
          if (result.error.code === 'promo_invalid') {
            patchPurchase({
              promoApplied: false,
              promoInvalid: true,
              promoCode: promoCode ?? null,
            });
            void navigate(purchaseJourneyPaths.orderSummaryInvalidPromo, { replace: true });
            return;
          }
          if (result.error.code === 'cart_stale' || result.error.code === 'catalog_stale') {
            resetCheckoutForRetry();
          }
          void navigate(getOrderSummaryPath(promoApplied, promoInvalid), { replace: true });
          return;
        }

        reportUserError(
          checkoutLogger,
          'purchase_payment_failed',
          result.error,
          result.error.message,
        );
        patchPurchase({ paymentStatus: 'failed' });
        void navigate(purchaseJourneyPaths.paymentFailed);
        return;
      }

      resetProcessingPaymentAttempt();
      if (
        result.paymentStatus === 'success' ||
        result.paymentStatus === 'failed' ||
        result.paymentStatus === 'unconfirmed' ||
        result.paymentStatus === 'confirming'
      ) {
        patchPaymentOutcome(patchPurchase, navigate, result.paymentStatus);
      }
    })();
  }, [
    checkoutReady,
    executePayment,
    navigate,
    patchPurchase,
    planId,
    paymentStatus,
    promoApplied,
    promoCode,
    promoInvalid,
    purchase?.paidAmountInr,
    riderCount,
  ]);

  return <R09ProcessingPaymentScreen />;
}

export function PaymentStillConfirmingRoute() {
  const navigate = useNavigate();
  const { session, purchase, patchPurchase } = usePurchaseCheckout();
  const { pollPaymentStatus } = usePaymentPolling();

  useEffect(() => {
    if (redirectIfPaymentSucceeded(navigate, purchase)) {
      return;
    }
    if (shouldLeavePaymentScreen(purchase, ['confirming', 'unconfirmed', 'success', 'failed'])) {
      void navigate(getOrderSummaryPath(purchase?.promoApplied, purchase?.promoInvalid), {
        replace: true,
      });
    }
  }, [navigate, purchase]);

  useEffect(() => {
    if (session.purchase?.paymentStatus !== 'confirming') {
      return;
    }

    const resumedOrderId = resolveCheckoutOrderId();
    if (!resumedOrderId) {
      patchPurchase({ paymentStatus: 'unconfirmed' });
      void navigate(purchaseJourneyPaths.paymentUnconfirmed, { replace: true });
      return;
    }

    const abortController = new AbortController();

    void (async () => {
      const result = await pollPaymentStatus(resumedOrderId);

      if (abortController.signal.aborted) {
        return;
      }

      if (!result.ok) {
        reportUserError(
          checkoutLogger,
          'purchase_payment_poll_failed',
          result.error,
          result.error.message,
        );
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
  }, [navigate, patchPurchase, pollPaymentStatus, session.purchase?.paymentStatus]);

  return <R09bStillConfirmingScreen />;
}

export function PaymentSuccessRoute() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session, updateSession, setPhase, selectedFlow } = useJourney();
  const { planId, riderCount, purchase } = usePurchaseCheckout();
  const { attachPurchaseQr, isPending: isAttachPending } = useQrAttach();
  const vehiclesSyncedRef = useRef(false);
  const attachStartedRef = useRef(false);
  const [invoiceDownloading, setInvoiceDownloading] = useState(false);
  const paidAmountInr = purchase?.paidAmountInr ?? 0;
  const orderId = resolveCheckoutOrderId();
  const vehicle = useMemo(() => session.vehicle ?? {}, [session.vehicle]);

  useEffect(() => {
    if (session.purchase?.paymentStatus !== 'success') {
      void navigate(
        getOrderSummaryPath(session.purchase?.promoApplied, session.purchase?.promoInvalid),
        {
          replace: true,
        },
      );
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
        reportUserError(
          vehicleLogger,
          'purchase_vehicle_sync_failed',
          result.error,
          result.error.message,
        );
      }
    });
  }, [session.purchase?.paymentStatus]);

  usePreventBrowserBack(session.purchase?.paymentStatus === 'success');

  useEffect(() => {
    if (session.purchase?.paymentStatus === 'success' && orderId) {
      prefetchOrderInvoice(orderId);
    }
  }, [orderId, session.purchase?.paymentStatus]);

  const attachAfterPayment = useCallback(() => {
    if (isAttachPending || attachStartedRef.current) {
      return;
    }
    attachStartedRef.current = true;

    void (async () => {
      persistVehicleContext({
        registration: vehicle.plate ?? '',
        fields: vehicle.fields,
        ownerName: session.auth?.ownerName,
        languageId: session.auth?.languageId,
        selectedPlanId: planId,
        riderCount,
      });

      try {
        const result = await attachPurchaseQr(searchParams, { force: true });
        if (!result.ok) {
          attachStartedRef.current = false;
          resetAttachAttemptCache();
          reportUserError(
            qrAttachLogger,
            'purchase_attach_after_payment_failed',
            result.error,
            result.error.message,
          );
          return;
        }

        const nextSession = {
          ...session,
          vehicle: {
            ...vehicle,
            confirmed: true,
          },
          emergency: {
            ...session.emergency,
            riderSkipped: false,
          },
          purchase: {
            ...session.purchase,
            selectedPlanId: planId,
            riderCount,
            checkoutReady: true,
          },
        };
        flushSync(() => {
          updateSession({
            vehicle: nextSession.vehicle,
            emergency: nextSession.emergency,
            purchase: nextSession.purchase,
          });
          setPhase('emergency');
        });
        // Use post-attach session so rider entitlement drives rider-prompt vs contacts.
        void navigate(getEmergencyHandoffPath(nextSession, selectedFlow ?? 'purchase'), {
          replace: true,
        });
      } catch (error: unknown) {
        attachStartedRef.current = false;
        resetAttachAttemptCache();
        reportUserError(qrAttachLogger, 'purchase_attach_after_payment_error', error);
      }
    })();
  }, [
    attachPurchaseQr,
    isAttachPending,
    navigate,
    planId,
    riderCount,
    searchParams,
    selectedFlow,
    session,
    setPhase,
    updateSession,
    vehicle,
  ]);

  return (
    <R10PaymentSuccessScreen
      selectedPlanId={planId}
      paidAmountInr={paidAmountInr}
      invoiceDownloading={invoiceDownloading}
      continueLoading={isAttachPending}
      onDownloadInvoice={
        orderId
          ? () => {
              if (invoiceDownloading) {
                return;
              }
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
        // Paid upgrade — attach only after payment, then emergency contacts/riders.
        attachAfterPayment();
      }}
    />
  );
}

export function PaymentFailedRoute() {
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
  }, [navigate, orderSummaryPath, session.purchase?.paymentStatus]);

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

export function PaymentUnconfirmedRoute() {
  const navigate = useNavigate();
  const { purchase, patchPurchase } = usePurchaseCheckout();
  const { pollPayment } = useCheckout();
  useEffect(() => {
    if (shouldLeavePaymentScreen(purchase, ['unconfirmed', 'success', 'failed'])) {
      void navigate(getOrderSummaryPath(purchase?.promoApplied, purchase?.promoInvalid), {
        replace: true,
      });
    }
  }, [navigate, purchase]);

  return (
    <R10cPaymentUnconfirmedScreen
      onBack={() => {
        patchPurchase({ paymentStatus: 'processing' });
        void navigate(purchaseJourneyPaths.processingPayment);
      }}
      onCheckStatus={() => {
        const resumedOrderId = resolveCheckoutOrderId();
        if (!resumedOrderId) {
          return;
        }
        void (async () => {
          const result = await pollPayment(resumedOrderId);
          if (!result.ok) {
            reportUserError(
              checkoutLogger,
              'purchase_payment_status_failed',
              result.error,
              result.error.message,
            );
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
