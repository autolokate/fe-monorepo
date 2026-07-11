import { getOrderInvoice as getOrderInvoiceApi } from '@autolokate/api-client';

import { getQrApiClient } from '@/platform/api/qr-api-client';

import { checkoutLogger } from './checkout-logger';

export async function fetchOrderInvoiceUrl(orderId: string): Promise<string | null> {
  try {
    const client = getQrApiClient();
    const invoice = await getOrderInvoiceApi(client, orderId);
    const url = invoice.invoiceUrl?.trim();
    if (!url) {
      return null;
    }
    checkoutLogger.info('order_invoice_loaded', { orderId });
    return url;
  } catch (error) {
    checkoutLogger.warn('order_invoice_failed', { orderId, error });
    return null;
  }
}
