import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELLED';

export type PaymentOutcome = 'PAID' | 'FAILED' | 'UNCONFIRMED' | 'PENDING' | 'REFUNDED';

export type PayOrderMode = 'ONLINE' | 'CASH';

/** Maps to OpenAPI `CreateOrderBodyDto` — required: cartId. */
export type CreateOrderBody = {
  cartId: string;
};

/** Maps to OpenAPI `OrderDto` — envelope `data` on POST /v1/orders. */
export type OrderDto = {
  orderId: string;
  subtotalPaise: number;
  gstPaise: number;
  discountPaise: number;
  totalPaise: number;
  appliedPromoCode?: string;
  status: OrderStatus;
};

/** Consumer commerce checkout — ONLINE-only; optional auto-renew mandate. */
export type PayOrderBody = {
  setupMandate?: boolean;
  mandateConsent?: boolean;
};

/** GST tax invoice / receipt for a paid order. */
export type OrderInvoiceDto = {
  invoiceUrl: string;
};

/**
 * Maps to OpenAPI `PaymentRefDto` — envelope `data` on POST /v1/orders/{orderId}/pay.
 *
 * Consumer commerce checkout is ONLINE-only on the server. When Razorpay keys are configured:
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

/** POST /v1/orders — create a consumer commerce order. */
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

/** GET /v1/orders/{orderId}/invoice — GST tax invoice for a paid order. */
export async function getOrderInvoice(client: ApiClient, orderId: string): Promise<OrderInvoiceDto> {
  const response = await client.get<unknown>(endpoints.orders.invoice(orderId));
  return unwrapEnvelope(response) as OrderInvoiceDto;
}
