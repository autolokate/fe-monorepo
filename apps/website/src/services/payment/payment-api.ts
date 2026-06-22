"use client";

import { endpoints } from "@/lib/api/endpoints";
import { ApiService } from "@/services/api.service";
import type {
  CreatePaymentOrderPayload,
  PaymentEnvelope,
  VerifyPaymentPayload,
} from "./types";

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function unbox<T>(res: PaymentEnvelope<T>): T {
  if (isRecord(res) && "data" in res) return (res as { data: T }).data;
  return res as T;
}

/** POST /v1/payments/orders — creates a Razorpay order for a booking. */
export async function createPaymentOrder(
  bookingId: string,
  idempotencyKey?: string,
): Promise<unknown> {
  const body: CreatePaymentOrderPayload = {
    booking_id: bookingId,
    idempotency_key:
      idempotencyKey ?? `order-${bookingId}-${Date.now()}`,
  };

  const res = await ApiService.post<PaymentEnvelope<unknown>>(
    endpoints.payments.createOrder,
    body,
  );
  return unbox(res.data);
}

/** POST /v1/payments/verify — server-side signature check. */
export async function verifyPayment(payload: VerifyPaymentPayload): Promise<unknown> {
  const res = await ApiService.post<PaymentEnvelope<unknown>>(
    endpoints.payments.verify,
    payload,
  );
  return unbox(res.data);
}

/** GET /v1/payments/{id} — fetch a single payment record. */
export async function getPaymentById(paymentId: string): Promise<unknown> {
  const res = await ApiService.get<PaymentEnvelope<unknown>>(
    endpoints.payments.byId(paymentId),
  );
  return unbox(res.data);
}
