import { checkoutLogger } from './checkout-logger';

const RAZORPAY_CHECKOUT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export type RazorpayCheckoutOutcome = 'success' | 'failed' | 'dismissed';

export type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

function extractFailureMessage(raw: unknown): string {
  if (raw && typeof raw === 'object' && 'error' in raw) {
    const err = (raw as { error?: { description?: string; reason?: string } }).error;
    return err?.description || err?.reason || 'Payment failed.';
  }
  return 'Payment failed.';
}

/** Lazily load Razorpay Checkout.js when the user starts payment. */
export async function ensureRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }
  if (window.Razorpay) {
    return true;
  }

  const existing = document.querySelector<HTMLScriptElement>(
    `script[src="${RAZORPAY_CHECKOUT_URL}"]`,
  );
  if (existing) {
    return new Promise<boolean>((resolve) => {
      existing.addEventListener(
        'load',
        () => {
          resolve(Boolean(window.Razorpay));
        },
        { once: true },
      );
      existing.addEventListener(
        'error',
        () => {
          resolve(false);
        },
        { once: true },
      );
    });
  }

  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_CHECKOUT_URL;
    script.async = true;
    script.onload = () => {
      resolve(Boolean(window.Razorpay));
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export type OpenRazorpayCheckoutParams = {
  /** OpenAPI `PaymentRefDto.paymentRef` — passed to Checkout.js `order_id`. */
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountPaise: number;
  description?: string;
};

/** Open Razorpay Checkout and resolve when the modal closes or payment completes. */
export async function openRazorpayCheckout(
  params: OpenRazorpayCheckoutParams,
): Promise<RazorpayCheckoutOutcome> {
  const publicKey = params.razorpayKeyId.trim();
  if (!publicKey) {
    checkoutLogger.warn('razorpay_key_missing');
    return 'failed';
  }

  if (!params.razorpayOrderId || params.amountPaise <= 0) {
    checkoutLogger.warn('razorpay_checkout_invalid_params', {
      hasOrderId: Boolean(params.razorpayOrderId),
      amountPaise: params.amountPaise,
    });
    return 'failed';
  }

  const scriptOk = await ensureRazorpayScript();
  const RazorpayCtor = window.Razorpay;
  if (!scriptOk || !RazorpayCtor) {
    checkoutLogger.warn('razorpay_script_load_failed');
    return 'failed';
  }

  checkoutLogger.info('razorpay_checkout_opening', {
    orderId: params.razorpayOrderId,
    amountPaise: params.amountPaise,
  });

  return new Promise<RazorpayCheckoutOutcome>((resolve) => {
    let settled = false;
    const settle = (outcome: RazorpayCheckoutOutcome) => {
      if (settled) {
        return;
      }
      settled = true;
      checkoutLogger.info('razorpay_checkout_closed', { outcome });
      resolve(outcome);
    };

    const rzp = new RazorpayCtor({
      key: publicKey,
      amount: params.amountPaise,
      currency: 'INR',
      name: 'Autolokate',
      description: params.description ?? 'Vehicle protection plan',
      order_id: params.razorpayOrderId,
      handler: (response: RazorpayHandlerResponse) => {
        checkoutLogger.info('razorpay_handler_success', {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          hasSignature: Boolean(response.razorpay_signature),
        });
        settle('success');
      },
      modal: {
        ondismiss: () => {
          settle('dismissed');
        },
      },
    });

    rzp.on('payment.failed', (raw: unknown) => {
      checkoutLogger.warn('razorpay_payment_failed', { message: extractFailureMessage(raw) });
      settle('failed');
    });

    rzp.open();
  });
}
