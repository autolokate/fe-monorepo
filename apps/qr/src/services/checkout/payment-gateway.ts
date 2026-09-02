import { env } from '@/config/env';

/** Razorpay publishable key (key_id) for Checkout.js — never the key_secret. */
export function getRazorpayPublishableKey(): string | null {
  return env.razorpayKey;
}

/** True when a Razorpay publishable key is configured for client-side checkout. */
export function isPaymentGatewayConfigured(): boolean {
  return Boolean(env.razorpayKey);
}
