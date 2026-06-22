/**
 * Minimal Razorpay Checkout shape we use. Cast through `unknown` when
 * constructing — Razorpay's options object is wide and largely untyped upstream.
 */
export interface RazorpayInstance {
  open: () => void;
  /** Subscribe to lifecycle events (`payment.failed`, etc.). */
  on: (event: string, handler: (response: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

/** Shape Razorpay sends to `payment.failed` listeners. */
export interface RazorpayPaymentFailedPayload {
  error?: {
    code?: string;
    description?: string;
    reason?: string;
    source?: string;
    step?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
  };
}

/** Pull a user-readable message out of a `payment.failed` payload. */
export function extractRazorpayFailureMessage(raw: unknown): string {
  if (raw && typeof raw === "object" && "error" in raw) {
    const err = (raw as RazorpayPaymentFailedPayload).error;
    return err?.description || err?.reason || "Payment failed. Please try again.";
  }
  return "Payment failed. Please try again.";
}

const RAZORPAY_CHECKOUT_URL = "https://checkout.razorpay.com/v1/checkout.js";

/**
 * Lazily load the Razorpay Checkout script. Resolves to `true` once `window.Razorpay`
 * is available; resolves to `false` if the script fails to load (offline, blocker).
 */
export async function ensureRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${RAZORPAY_CHECKOUT_URL}"]`,
  );
  if (existing) {
    return new Promise<boolean>((resolve) => {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)), {
        once: true,
      });
      existing.addEventListener("error", () => resolve(false), { once: true });
    });
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};
