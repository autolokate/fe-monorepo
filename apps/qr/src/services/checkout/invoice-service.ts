import { getOrderInvoice as getOrderInvoiceApi } from '@autolokate/api-client';

import { env } from '@/config/env';
import { getQrApiClient } from '@/platform/api/qr-api-client';
import { peekOrderId } from '@/services/checkout/checkout-cache';
import { getCheckout } from '@/storage/index';

import { checkoutLogger } from './checkout-logger';

const invoiceUrlByOrderId = new Map<string, string | null>();
const inflightByOrderId = new Map<string, Promise<string | null>>();

const INVOICE_URL_KEYS = ['invoiceUrl', 'url', 'downloadUrl', 'pdfUrl', 'href'] as const;

function normalizeInvoiceUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = env.apiBaseUrl.replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

function resolveInvoiceUrl(invoice: Record<string, unknown>): string | null {
  for (const key of INVOICE_URL_KEYS) {
    const value = invoice[key];
    if (typeof value === 'string' && value.trim()) {
      return normalizeInvoiceUrl(value.trim());
    }
  }
  return null;
}

async function loadInvoiceUrl(orderId: string): Promise<string | null> {
  try {
    const client = getQrApiClient();
    const invoice = await getOrderInvoiceApi(client, orderId);
    const url = resolveInvoiceUrl(invoice);
    if (!url) {
      checkoutLogger.warn('order_invoice_missing_url', { orderId, invoice });
      return null;
    }
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

/** GET /v1/orders/{orderId}/invoice — cached and deduped per orderId. */
export async function fetchOrderInvoiceUrl(orderId: string): Promise<string | null> {
  const normalizedOrderId = orderId.trim();
  if (!normalizedOrderId) {
    return null;
  }

  if (invoiceUrlByOrderId.has(normalizedOrderId)) {
    return invoiceUrlByOrderId.get(normalizedOrderId) ?? null;
  }

  const inflight = inflightByOrderId.get(normalizedOrderId);
  if (inflight) {
    return inflight;
  }

  const promise = loadInvoiceUrl(normalizedOrderId);
  inflightByOrderId.set(normalizedOrderId, promise);

  try {
    const url = await promise;
    invoiceUrlByOrderId.set(normalizedOrderId, url);
    return url;
  } finally {
    inflightByOrderId.delete(normalizedOrderId);
  }
}

/** Fetch invoice once and open in a new tab. */
export async function openOrderInvoice(orderId: string): Promise<boolean> {
  const url = await fetchOrderInvoiceUrl(orderId);
  if (!url) {
    return false;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
  return true;
}

/** Reset between tests. */
export function clearInvoiceCacheForTests(): void {
  invoiceUrlByOrderId.clear();
  inflightByOrderId.clear();
}
