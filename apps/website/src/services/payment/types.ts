import type { ApiEnvelope } from "@/services/auth/types";

/** Body for `POST /v1/payments/orders`. */
export interface CreatePaymentOrderPayload {
  booking_id: string;
  /** Server-side idempotency guard; FE generates a uuid (or fallback) per attempt. */
  idempotency_key: string;
}

/** Body for `POST /v1/payments/verify` — passthrough of the Razorpay handler response. */
export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export type PaymentEnvelope<T> = ApiEnvelope<T>;
