import type { ApiClient } from './client';
import type { ApiPlanTier } from './plans';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

export type OrderStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELLED';

export type PaymentOutcome = 'PAID' | 'FAILED' | 'UNCONFIRMED' | 'PENDING' | 'REFUNDED';

export type PayOrderMode = 'ONLINE' | 'CASH';

/**
 * Nest QR create-order body (`POST /v1/orders`, OpenAPI `CreateOrderBodyDto`).
 * The code must already be ATTACHED to a vehicle or Nest answers 409 `not_provisioned`.
 * Website retail uses {@link CreateRetailOrderBody} on `/v1/retail/orders` instead.
 */
export type CreateQrOrderBody = {
  code: string;
  planTier: ApiPlanTier;
  riderCount: number;
  promoCode?: string;
};

/** Website retail — `POST /v1/retail/orders` (not QR `/v1/orders`). */
export type CreateRetailOrderBody = {
  cartId: string;
  addressId: string;
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

/** Website retail detail / list row (`GET /v1/retail/orders*`). */
export type RetailOrderDetailDto = OrderDto & {
  cartId: string;
  addressId: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Maps to OpenAPI `PayOrderBodyDto` — `mode` is required by Nest. Consumer self-pay is
 * ONLINE-only (CASH is a partner-counter channel); optional auto-renew mandate.
 */
export type PayOrderBody = {
  mode: 'ONLINE';
  setupMandate?: boolean;
  mandateConsent?: boolean;
};

/**
 * Maps to OpenAPI `InvoiceDto` — envelope `data` on GET /v1/orders/{orderId}/invoice
 * (and the retail twin). Field is `downloadUrl`, not a legacy `invoiceUrl`.
 */
export type OrderInvoiceDto = {
  invoiceNumber: string;
  issuedAt: string;
  totalPaise: number;
  downloadUrl: string;
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

/** POST /v1/orders — QR protection-plan commerce for a scanned, attached code. */
export async function createOrder(
  client: ApiClient,
  body: CreateQrOrderBody,
  idempotencyKey: string,
): Promise<OrderDto> {
  const response = await client.post<unknown>(endpoints.orders.create, body, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return unwrapEnvelope(response) as OrderDto;
}

/** POST /v1/retail/orders — Website retail checkout (`cartId` + `addressId`). */
export async function createRetailOrder(
  client: ApiClient,
  body: CreateRetailOrderBody,
  idempotencyKey: string,
): Promise<OrderDto> {
  const response = await client.post<unknown>(endpoints.retailOrders.create, body, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });
  return unwrapEnvelope(response) as OrderDto;
}

/** GET /v1/retail/orders — caller's retail orders newest first. */
export async function listRetailOrders(
  client: ApiClient,
  limit = 20,
): Promise<RetailOrderDetailDto[]> {
  const response = await client.get<unknown>(endpoints.retailOrders.list(limit));
  return unwrapEnvelope(response) as RetailOrderDetailDto[];
}

/** GET /v1/retail/orders/{id} — one retail order owned by the caller. */
export async function getRetailOrder(
  client: ApiClient,
  orderId: string,
): Promise<RetailOrderDetailDto> {
  const response = await client.get<unknown>(endpoints.retailOrders.byId(orderId));
  return unwrapEnvelope(response) as RetailOrderDetailDto;
}

/**
 * POST /v1/retail/orders/{id}/pay — Option A retail checkout initiate.
 * Server returns paymentRef + optional Razorpay fields; PAID only after webhook.
 */
export async function payRetailOrder(
  client: ApiClient,
  orderId: string,
  idempotencyKey: string,
): Promise<PaymentRefDto> {
  const response = await client.post<unknown>(
    endpoints.retailOrders.pay(orderId),
    {},
    {
      headers: { 'Idempotency-Key': idempotencyKey },
    },
  );
  return unwrapEnvelope(response) as PaymentRefDto;
}

/** GET /v1/retail/orders/{id}/payment — poll retail payment outcome. */
export async function getRetailOrderPayment(
  client: ApiClient,
  orderId: string,
): Promise<PaymentOutcomeDto> {
  const response = await client.get<unknown>(endpoints.retailOrders.payment(orderId));
  return unwrapEnvelope(response) as PaymentOutcomeDto;
}

/** GET /v1/retail/orders/{id}/invoice — stub invoice metadata after paid transition. */
export async function getRetailOrderInvoice(
  client: ApiClient,
  orderId: string,
): Promise<OrderInvoiceDto> {
  const response = await client.get<unknown>(endpoints.retailOrders.invoice(orderId));
  return unwrapEnvelope(response) as OrderInvoiceDto;
}

/** POST /v1/orders/{orderId}/pay — QR commerce open payment and receive paymentRef. */
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
export async function getOrderPayment(
  client: ApiClient,
  orderId: string,
): Promise<PaymentOutcomeDto> {
  const response = await client.get<unknown>(endpoints.orders.payment(orderId));
  return unwrapEnvelope(response) as PaymentOutcomeDto;
}

/** GET /v1/orders/{orderId}/invoice — GST tax invoice for a paid order. */
export async function getOrderInvoice(
  client: ApiClient,
  orderId: string,
): Promise<OrderInvoiceDto> {
  const response = await client.get<unknown>(endpoints.orders.invoice(orderId));
  return unwrapEnvelope(response) as OrderInvoiceDto;
}
