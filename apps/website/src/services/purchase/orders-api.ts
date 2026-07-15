'use client';

import { endpoints } from '@/lib/api/endpoints';
import { ApiError } from '@/lib/api/error';
import { PurchaseApi, newIdempotencyKey } from './client';
import type {
  CreateOrderPayload,
  Invoice,
  Order,
  OrderSummary,
  OrderTracking,
  PayOrderPayload,
  PaymentOutcome,
  PaymentRef,
} from './types';

interface Enveloped<T> {
  data?: T;
}

/** GET /v1/orders — the buyer's order history, newest first (bearer). */
export async function listOrders(limit = 20): Promise<OrderSummary[]> {
  const res = await PurchaseApi.get<Enveloped<OrderSummary[]>>(endpoints.orders.list(limit));
  return res.data.data ?? [];
}

/**
 * POST /v1/orders — creates the order from the latest cart + a saved address id
 * (bearer + a fresh `Idempotency-Key`). The backend snapshots the address at
 * sale, so we only send its id — never the inline lines.
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const body = { cartId: payload.cartId, addressId: payload.addressId };

  const res = await PurchaseApi.post<Enveloped<Order>>(endpoints.orders.create, body, {
    headers: { 'Idempotency-Key': newIdempotencyKey() },
  });
  const order = res.data.data;
  if (!order?.orderId) throw new ApiError('Invalid order response', 0, res.data);
  return order;
}

/**
 * POST /v1/orders/:id/pay — kicks off payment + (optionally) the auto-renew
 * mandate (bearer + a fresh `Idempotency-Key`). Returns the Razorpay handles.
 */
export async function payOrder(orderId: string, payload: PayOrderPayload): Promise<PaymentRef> {
  const res = await PurchaseApi.post<Enveloped<PaymentRef>>(
    endpoints.orders.pay(orderId),
    payload,
    { headers: { 'Idempotency-Key': newIdempotencyKey() } },
  );
  const ref = res.data.data;
  if (!ref?.paymentRef) throw new ApiError('Invalid payment response', 0, res.data);
  return ref;
}

/** GET /v1/orders/:id/payment — poll for the payment outcome (bearer). */
export async function getOrderPayment(orderId: string): Promise<PaymentOutcome> {
  const res = await PurchaseApi.get<Enveloped<{ outcome: PaymentOutcome }>>(
    endpoints.orders.payment(orderId),
  );
  const outcome = res.data.data?.outcome;
  if (!outcome) throw new ApiError('Invalid payment outcome response', 0, res.data);
  return outcome;
}

/** GET /v1/orders/:id — order status + shipping fulfillment (bearer). */
export async function getOrder(orderId: string): Promise<OrderTracking> {
  const res = await PurchaseApi.get<Enveloped<OrderTracking>>(endpoints.orders.byId(orderId));
  const order = res.data.data;
  if (!order?.orderId) throw new ApiError('Invalid order response', 0, res.data);
  return order;
}

/** GET /v1/orders/:id/invoice — the GST invoice for a paid order (bearer). */
export async function getOrderInvoice(orderId: string): Promise<Invoice> {
  const res = await PurchaseApi.get<Enveloped<Invoice>>(endpoints.orders.invoice(orderId));
  const invoice = res.data.data;
  if (!invoice?.id && !invoice?.invoiceNumber) {
    throw new ApiError('Invalid invoice response', 0, res.data);
  }
  return invoice;
}
