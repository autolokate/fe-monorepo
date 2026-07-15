/** One Pay attempt per tab — survives StrictMode remount so Razorpay is not cancelled mid-open. */
let processingPaymentAttemptKey: string | null = null;

export function getProcessingPaymentAttemptKey(): string | null {
  return processingPaymentAttemptKey;
}

export function setProcessingPaymentAttemptKey(key: string | null): void {
  processingPaymentAttemptKey = key;
}

/** Call from Pay CTA before navigating to processing so a retry always starts a new attempt. */
export function resetProcessingPaymentAttempt(): void {
  processingPaymentAttemptKey = null;
}
