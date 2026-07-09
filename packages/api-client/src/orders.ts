import type { ApiClient } from './client';
import type { ApiPlanTier } from './plans';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELLED';

export type PaymentOutcome = 'PAID' | 'FAILED' | 'UNCONFIRMED' | 'PENDING' | 'REFUNDED';

export type PayOrderMode = 'ONLINE' | 'CASH';

/** Maps to OpenAPI `CreateOrderBodyDto` — required: code, planTier, riderCount; optional: promoCode. */
export type CreateOrderBody = {
  code: string;
  planTier: ApiPlanTier;
  riderCount: number;
  promoCode?: string;
};

/** Maps to OpenAPI `OrderDto` — envelope `data` on POST /v1/orders. */
export type OrderDto = {
  orderId: string;
  totalPaise: number;
  status: OrderStatus;
};

/** Maps to OpenAPI `PayOrderBodyDto` — required: mode. */
export type PayOrderBody = {
  mode: PayOrderMode;
  setupMandate?: boolean;
  mandateConsent?: boolean;
};

/**
 * Maps to OpenAPI `PaymentRefDto` — envelope `data` on POST /v1/orders/{orderId}/pay.
 *
 * Only `paymentRef` is required. `providerOrderId` / `razorpayKeyId` are present
 * when `mode=ONLINE` and live Razorpay keys are configured on the backend:
 *  - providerOrderId → pass to the Razorpay SDK as `order_id`
 *  - razorpayKeyId   → pass to the Razorpay SDK as `key`
 */
export type PaymentRefDto = {
  paymentRef: string;
  providerOrderId?: string;
  razorpayKeyId?: string;
};

/** Maps to OpenAPI `PaymentOutcomeDto` — envelope `data` on GET /v1/orders/{orderId}/payment. */
export type PaymentOutcomeDto = {
  outcome: PaymentOutcome;
};

/** POST /v1/orders — create a consumer self-pay order. */
export async function createOrder(
  client: ApiClient,
  body: CreateOrderBody,
  idempotencyKey: string,
): Promise<OrderDto> {
  const response = await client.post<unknown>(endpoints.orders.create, body, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return unwrapEnvelope(response) as OrderDto;
}

/** POST /v1/orders/{orderId}/pay — open payment and receive paymentRef. */
export async function payOrder(
  client: ApiClient,
  orderId: string,
  body: PayOrderBody,
  idempotencyKey: string,
): Promise<PaymentRefDto> {
  const response = await client.post<unknown>(endpoints.orders.pay(orderId), body, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return unwrapEnvelope(response) as PaymentRefDto;
}

/** GET /v1/orders/{orderId}/payment — poll coarse payment outcome. */
export async function getOrderPayment(client: ApiClient, orderId: string): Promise<PaymentOutcomeDto> {
  const response = await client.get<unknown>(endpoints.orders.payment(orderId));
  return unwrapEnvelope(response) as PaymentOutcomeDto;
}
