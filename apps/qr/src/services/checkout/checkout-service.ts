import {
  createOrder as createOrderApi,
  getOrderPayment as getOrderPaymentApi,
  payOrder as payOrderApi,
  ApiError,
} from '@autolokate/api-client';

import type { PurchasePaymentStatus } from '@/features/qr-purchase/types-checkout';
import { getQrApiClient } from '@/platform/api/qr-api-client';

import {
  clearCheckoutCache,
  getCheckoutRevision,
  getInflightPayment,
  getInflightPrepare,
  peekCheckoutSummary,
  peekOrderId,
  peekPaymentRef,
  peekTotalPaise,
  readCheckoutState,
  resetCheckoutPaymentAttempt,
  setInflightPayment,
  setInflightPrepare,
  updateCheckoutState,
} from './checkout-cache';
import { mapCheckoutApiError, type CheckoutError } from './checkout-errors';
import {
  buildCheckoutParamsKey,
  createIdempotencyKey,
  mapCheckoutParamsToCreateOrderBody,
  mapOrderToSummary,
  mapPaymentOutcomeToStatus,
  type CheckoutParams,
} from './checkout-mapper';
import { checkoutLogger } from './checkout-logger';
import { isPendingPaymentOutcome } from './payment-outcome';
import { getRazorpayPublishableKey } from './payment-gateway';
import { patchCheckout, clearCheckout } from '@/storage/index';
import { openRazorpayCheckout } from './razorpay-checkout';
import {
  formatCreateOrderBodyForLog,
  resolveOrderQrCode,
} from './resolve-order-qr-code';

export type PrepareCheckoutResult =
  | { ok: true; revision: number }
  | { ok: false; error: CheckoutError };

export type PaymentFlowResult =
  | { ok: true; paymentStatus: PurchasePaymentStatus }
  | {
      ok: false;
      error: CheckoutError;
      paymentStatus?: PurchasePaymentStatus;
      phase?: 'prepare' | 'payment';
    };

const POLL_INITIAL_MS = 1000;
const POLL_MAX_MS = 8000;
const POLL_TIMEOUT_MS = 45_000;
const CONFIRMING_AFTER_MS = 4000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function createOrderForParams(params: CheckoutParams): Promise<PrepareCheckoutResult> {
  const purchaseQrCode = resolveOrderQrCode();
  if (!purchaseQrCode) {
    checkoutLogger.warn('prepare_checkout_blocked', { reason: 'missing_purchase_qr_code' });
    return {
      ok: false,
      error: { code: 'unavailable', message: 'Missing purchase QR code.' },
    };
  }

  const paramsKey = buildCheckoutParamsKey(params);
  const current = readCheckoutState();

  if (current.orderSummary && current.paramsKey === paramsKey && current.orderId) {
    checkoutLogger.info('prepare_checkout_cached', {
      orderId: current.orderId,
      orderStatus: current.orderStatus,
      totalPaise: current.totalPaise,
    });
    return { ok: true, revision: getCheckoutRevision() };
  }

  const idempotencyKey =
    current.paramsKey === paramsKey && current.createIdempotencyKey
      ? current.createIdempotencyKey
      : createIdempotencyKey();

  const createBody = mapCheckoutParamsToCreateOrderBody(params, purchaseQrCode);

  try {
    const client = getQrApiClient();
    checkoutLogger.info('order_create_request', {
      body: formatCreateOrderBodyForLog(createBody),
      idempotencyKey,
    });

    const order = await createOrderApi(client, createBody, idempotencyKey);
    const orderSummary = mapOrderToSummary(order, params);

    updateCheckoutState({
      orderId: order.orderId,
      orderStatus: order.status,
      createIdempotencyKey: idempotencyKey,
      orderSummary,
      totalPaise: order.totalPaise,
      paramsKey,
      paymentRef: null,
      providerOrderId: null,
      razorpayKeyId: null,
      payIdempotencyKey: null,
    });
    patchCheckout({
      orderId: order.orderId,
      orderStatus: order.status,
      totalPaise: order.totalPaise,
      paymentRef: null,
    });

    checkoutLogger.info('order_create_response', {
      orderId: order.orderId,
      totalPaise: order.totalPaise,
      status: order.status,
    });
    return { ok: true, revision: getCheckoutRevision() };
  } catch (error) {
    checkoutLogger.warn('order_create_failed', { error, body: formatCreateOrderBodyForLog(createBody) });
    return { ok: false, error: mapCheckoutApiError(error) };
  }
}

/** Create backend order — invoked only from runCheckoutPayment (Pay securely), not on R08 mount. */
export async function prepareCheckout(params: CheckoutParams): Promise<PrepareCheckoutResult> {
  checkoutLogger.info('prepare_checkout_start', { planId: params.planId, riderCount: params.riderCount });
  const inflight = getInflightPrepare();
  if (inflight) {
    return (await inflight) as PrepareCheckoutResult;
  }

  const promise = createOrderForParams(params);
  setInflightPrepare(promise);

  try {
    return await promise;
  } finally {
    setInflightPrepare(null);
  }
}

type InitiateOrderPaymentSuccess = {
  ok: true;
  paymentRef: string;
  providerOrderId?: string;
  razorpayKeyId?: string;
};

type InitiateOrderPaymentResult =
  | InitiateOrderPaymentSuccess
  | { ok: false; error: CheckoutError; paymentStatus?: PurchasePaymentStatus; needsNewOrder?: boolean };

/** Drop stale order + payment refs so retry creates a fresh POST /v1/orders. */
export function resetCheckoutForRetry(): void {
  clearCheckoutCache();
  clearCheckout();
  checkoutLogger.info('checkout_reset_for_retry');
}

async function handlePayConflict(
  client: ReturnType<typeof getQrApiClient>,
  orderId: string,
  cause: unknown,
): Promise<InitiateOrderPaymentResult> {
  try {
    const { outcome } = await getOrderPaymentApi(client, orderId);
    const paymentStatus = mapPaymentOutcomeToStatus(outcome);

    if (paymentStatus === 'success') {
      checkoutLogger.info('payment_conflict_already_paid', { orderId });
      return { ok: false, error: { code: 'unavailable', message: 'Payment already completed.' }, paymentStatus: 'success' };
    }

    const current = readCheckoutState();
    if (paymentStatus === 'processing' && current.paymentRef && current.providerOrderId) {
      checkoutLogger.info('payment_conflict_resume_existing', { orderId, paymentRef: current.paymentRef });
      return {
        ok: true,
        paymentRef: current.paymentRef,
        providerOrderId: current.providerOrderId,
        razorpayKeyId: current.razorpayKeyId ?? undefined,
      };
    }

    if (paymentStatus === 'failed') {
      checkoutLogger.info('payment_conflict_failed_order', { orderId });
      return {
        ok: false,
        error: { code: 'payment_failed', message: 'Previous payment attempt failed. Starting a new one.' },
        paymentStatus: 'failed',
        needsNewOrder: true,
      };
    }
  } catch (pollError) {
    checkoutLogger.warn('payment_conflict_poll_failed', { orderId, error: pollError });
  }

  checkoutLogger.warn('payment_conflict_needs_new_order', { orderId, cause });
  return {
    ok: false,
    error: {
      code: 'unavailable',
      message: 'This payment session expired. Starting a new one.',
    },
    paymentStatus: 'failed',
    needsNewOrder: true,
  };
}

async function initiateOrderPayment(orderId: string): Promise<InitiateOrderPaymentResult> {
  const client = getQrApiClient();
  const current = readCheckoutState();
  const payIdempotencyKey = current.payIdempotencyKey ?? createIdempotencyKey();

  if (current.paymentRef) {
    return {
      ok: true,
      paymentRef: current.paymentRef,
      providerOrderId: current.providerOrderId ?? undefined,
      razorpayKeyId: current.razorpayKeyId ?? undefined,
    };
  }

  try {
    const payBody = { mode: 'ONLINE' as const };
    checkoutLogger.info('payment_open_request', { orderId, body: payBody, idempotencyKey: payIdempotencyKey });
    const payment = await payOrderApi(client, orderId, payBody, payIdempotencyKey);
    updateCheckoutState({
      paymentRef: payment.paymentRef,
      providerOrderId: payment.providerOrderId ?? null,
      razorpayKeyId: payment.razorpayKeyId ?? null,
      payIdempotencyKey,
    });
    patchCheckout({ paymentRef: payment.paymentRef });
    checkoutLogger.info('payment_open_response', {
      orderId,
      paymentRef: payment.paymentRef,
      hasProviderOrderId: Boolean(payment.providerOrderId),
      hasRazorpayKeyId: Boolean(payment.razorpayKeyId),
    });
    return {
      ok: true,
      paymentRef: payment.paymentRef,
      providerOrderId: payment.providerOrderId,
      razorpayKeyId: payment.razorpayKeyId,
    };
  } catch (error) {
    checkoutLogger.warn('payment_open_failed', { error });
    if (error instanceof ApiError && error.status === 409) {
      return handlePayConflict(client, orderId, error);
    }
    return { ok: false, error: mapCheckoutApiError(error), paymentStatus: 'failed' };
  }
}

async function pollOrderPaymentUntilTerminal(orderId: string): Promise<PaymentFlowResult> {
  const client = getQrApiClient();
  const startedAt = Date.now();
  let delayMs = POLL_INITIAL_MS;
  let sawPending = false;

  checkoutLogger.info('payment_poll_start', { orderId });

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    try {
      const { outcome } = await getOrderPaymentApi(client, orderId);
      const mapped = mapPaymentOutcomeToStatus(outcome);

      if (isPendingPaymentOutcome(outcome)) {
        sawPending = true;
        const elapsed = Date.now() - startedAt;
        if (elapsed >= CONFIRMING_AFTER_MS) {
          checkoutLogger.info('payment_poll_confirming', { orderId, elapsed });
          return { ok: true, paymentStatus: 'confirming' };
        }
      } else if (mapped === 'success' || mapped === 'failed' || mapped === 'unconfirmed') {
        checkoutLogger.info('payment_poll_terminal', { orderId, outcome, mapped });
        return { ok: true, paymentStatus: mapped };
      }
    } catch (error) {
      checkoutLogger.warn('payment_poll_failed', { error });
      return { ok: false, error: mapCheckoutApiError(error), phase: 'payment' };
    }

    await sleep(delayMs);
    delayMs = Math.min(delayMs * 2, POLL_MAX_MS);
  }

  checkoutLogger.warn('payment_poll_timeout', { orderId, sawPending });
  return { ok: true, paymentStatus: sawPending ? 'unconfirmed' : 'unconfirmed' };
}

type InternalPaymentFlowResult = PaymentFlowResult & { needsNewOrder?: boolean };

async function payAndPoll(orderId: string): Promise<InternalPaymentFlowResult> {
  checkoutLogger.info('pay_and_poll_start', { orderId });

  const initiated = await initiateOrderPayment(orderId);
  if (!initiated.ok) {
    if (initiated.paymentStatus === 'success') {
      return { ok: true, paymentStatus: 'success' };
    }
    if (initiated.needsNewOrder) {
      return { ...initiated, phase: 'payment', needsNewOrder: true };
    }
    return { ...initiated, phase: 'payment' };
  }

  // Backend is the source of truth for the Razorpay order_id + key.
  // VITE_RAZORPAY_KEY is only a fallback for the key when the backend omits it.
  const razorpayOrderId = initiated.providerOrderId;
  const razorpayKeyId = initiated.razorpayKeyId ?? getRazorpayPublishableKey();

  if (!razorpayOrderId) {
    checkoutLogger.warn('payment_gateway_skipped', {
      orderId,
      paymentRef: initiated.paymentRef,
      reason: 'missing_provider_order_id',
    });
    return pollOrderPaymentUntilTerminal(orderId);
  }

  if (!razorpayKeyId) {
    checkoutLogger.warn('payment_gateway_unavailable', {
      orderId,
      paymentRef: initiated.paymentRef,
      reason: 'missing_razorpay_key',
    });
    return pollOrderPaymentUntilTerminal(orderId);
  }

  const amountPaise = peekTotalPaise() ?? 0;
  const gatewayOutcome = await openRazorpayCheckout({
    razorpayOrderId,
    razorpayKeyId,
    amountPaise,
  });

  if (gatewayOutcome === 'dismissed') {
    return {
      ok: false,
      error: { code: 'payment_cancelled', message: 'Payment was cancelled.' },
      phase: 'payment',
    };
  }

  if (gatewayOutcome === 'failed') {
    return {
      ok: false,
      error: { code: 'payment_failed', message: 'Payment failed.' },
      paymentStatus: 'failed',
      phase: 'payment',
    };
  }

  return pollOrderPaymentUntilTerminal(orderId);
}

/** Pay an existing order via Razorpay, then poll backend payment outcome. */
export async function runCheckoutPayment(params: CheckoutParams): Promise<PaymentFlowResult> {
  checkoutLogger.info('run_checkout_payment_start', { planId: params.planId });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const prepared = await prepareCheckout(params);
    if (!prepared.ok) {
      checkoutLogger.warn('run_checkout_payment_prepare_failed', { error: prepared.error });
      return { ok: false, error: prepared.error, phase: 'prepare' };
    }

    const orderId = peekOrderId();
    if (!orderId) {
      return {
        ok: false,
        error: { code: 'unavailable', message: 'Order was not created.' },
        phase: 'prepare',
      };
    }

    const inflight = getInflightPayment();
    if (inflight) {
      return (await inflight) as PaymentFlowResult;
    }

    const promise = payAndPoll(orderId);
    setInflightPayment(promise);

    let result: InternalPaymentFlowResult;
    try {
      result = await promise;
    } finally {
      setInflightPayment(null);
    }

    if (!result.ok && result.needsNewOrder && attempt === 0) {
      resetCheckoutForRetry();
      checkoutLogger.info('checkout_payment_retry_with_new_order');
      continue;
    }

    const { needsNewOrder: _needsNewOrder, ...publicResult } = result;
    return publicResult;
  }

  return {
    ok: false,
    error: { code: 'unavailable', message: 'Payment could not be started. Please try again.' },
    phase: 'payment',
  };
}

/** Poll payment for an order already in confirming state (R09b / R10c). */
export async function pollCheckoutPayment(orderId: string): Promise<PaymentFlowResult> {
  const client = getQrApiClient();

  try {
    const { outcome } = await getOrderPaymentApi(client, orderId);
    const paymentStatus = mapPaymentOutcomeToStatus(outcome);

    if (paymentStatus === 'success' || paymentStatus === 'failed' || paymentStatus === 'unconfirmed') {
      return { ok: true, paymentStatus };
    }

    // PENDING → keep polling (R09b loop). Do not collapse to confirming on a single read.
    return { ok: true, paymentStatus: 'processing' };
  } catch (error) {
    return { ok: false, error: mapCheckoutApiError(error) };
  }
}

export function getCheckoutSummary(): ReturnType<typeof peekCheckoutSummary> {
  return peekCheckoutSummary();
}

export type { CheckoutParams } from './checkout-mapper';
export {
  clearCheckoutCache,
  resetCheckoutPaymentAttempt,
  getCheckoutRevision,
  peekOrderId,
  peekPaymentRef,
};
