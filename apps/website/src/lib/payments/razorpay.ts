'use client';

import { ensureRazorpayScript } from '@/lib/booking/razorpay';

export interface RazorpayCheckoutOptions {
  /** `razorpayKeyId` from the pay response. */
  keyId: string;
  /** `providerOrderId` (Razorpay order id) from the pay response. */
  orderId: string;
  amountPaise?: number;
  name?: string;
  description?: string;
  prefill?: { name?: string; contact?: string; email?: string };
}

export type RazorpayResult =
  | { status: 'paid' }
  | { status: 'dismissed' }
  | { status: 'unavailable' };

/**
 * Opens the Razorpay checkout modal for a provider order. Resolves `paid` when
 * the buyer completes payment (the backend webhook does the authoritative
 * capture — we just poll the order afterwards), `dismissed` if they close it or
 * it fails, or `unavailable` if the SDK / credentials are missing.
 */
export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions,
): Promise<RazorpayResult> {
  if (!options.keyId || !options.orderId) return { status: 'unavailable' };

  const ready = await ensureRazorpayScript();
  if (!ready || typeof window === 'undefined') {
    return { status: 'unavailable' };
  }
  const Razorpay = window.Razorpay;
  if (!Razorpay) {
    return { status: 'unavailable' };
  }

  return new Promise<RazorpayResult>((resolve) => {
    let settled = false;
    const finish = (result: RazorpayResult) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const rzp = new Razorpay({
      key: options.keyId,
      order_id: options.orderId,
      amount: options.amountPaise,
      currency: 'INR',
      name: options.name ?? 'Autolokate',
      description: options.description,
      prefill: options.prefill,
      theme: { color: '#0f172a' },
      handler: () => {
        finish({ status: 'paid' });
      },
      modal: {
        ondismiss: () => {
          finish({ status: 'dismissed' });
        },
      },
    });
    // Card declines / wrong OTP fire `payment.failed` instead of `handler`.
    rzp.on('payment.failed', () => {
      finish({ status: 'dismissed' });
    });
    rzp.open();
  });
}
