import { getOrderInvoice as getOrderInvoiceApi } from '@autolokate/api-client';

import { env } from '@/config/env';
import { getQrApiClient } from '@/platform/api/qr-api-client';
import { peekOrderId } from '@/services/checkout/checkout-cache';
import { getCheckout } from '@/storage/index';

import { checkoutLogger } from './checkout-logger';

const invoiceUrlByOrderId = new Map<string, string>();
const inflightByOrderId = new Map<string, Promise<string | null>>();

const INVOICE_RETRY_ATTEMPTS = 4;
const INVOICE_RETRY_BASE_MS = 700;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function normalizeInvoiceUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = env.apiBaseUrl.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

async function loadInvoiceUrlOnce(orderId: string): Promise<string | null> {
  try {
    const client = getQrApiClient();
    const invoice = await getOrderInvoiceApi(client, orderId);
    const rawUrl = invoice.invoiceUrl.trim();
    if (!rawUrl) {
      checkoutLogger.warn('order_invoice_missing_url', { orderId, invoice });
      return null;
    }
    const url = normalizeInvoiceUrl(rawUrl);
    checkoutLogger.info('order_invoice_loaded', { orderId });
    return url;
  } catch (error) {
    checkoutLogger.warn('order_invoice_failed', { orderId, error });
    return null;
  }
}

/** Order id from in-memory checkout cache or session storage. */
export function resolveCheckoutOrderId(): string | null {
  return peekOrderId() ?? getCheckout()?.orderId ?? null;
}

/**
 * GET /v1/orders/{orderId}/invoice — cached on success only.
 * Misses are retried so a just-paid order can finish invoice generation.
 */
export async function fetchOrderInvoiceUrl(orderId: string): Promise<string | null> {
  const normalizedOrderId = orderId.trim();
  if (!normalizedOrderId) {
    return null;
  }

  const cached = invoiceUrlByOrderId.get(normalizedOrderId);
  if (cached) {
    return cached;
  }

  const inflight = inflightByOrderId.get(normalizedOrderId);
  if (inflight) {
    return inflight;
  }

  const promise = (async (): Promise<string | null> => {
    for (let attempt = 0; attempt < INVOICE_RETRY_ATTEMPTS; attempt += 1) {
      const url = await loadInvoiceUrlOnce(normalizedOrderId);
      if (url) {
        invoiceUrlByOrderId.set(normalizedOrderId, url);
        return url;
      }
      if (attempt < INVOICE_RETRY_ATTEMPTS - 1) {
        await delay(INVOICE_RETRY_BASE_MS * (attempt + 1));
      }
    }
    return null;
  })();

  inflightByOrderId.set(normalizedOrderId, promise);

  try {
    return await promise;
  } finally {
    inflightByOrderId.delete(normalizedOrderId);
  }
}

/** Fetch invoice (with short retries) and open in a new tab. */
export async function openOrderInvoice(orderId: string): Promise<boolean> {
  const url = await fetchOrderInvoiceUrl(orderId);
  if (!url) {
    return false;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/** Prefetch so "Download tax invoice" is warm when the user taps it. */
export function prefetchOrderInvoice(orderId: string): void {
  void fetchOrderInvoiceUrl(orderId);
}

/** Reset between tests. */
export function clearInvoiceCacheForTests(): void {
  invoiceUrlByOrderId.clear();
  inflightByOrderId.clear();
}
