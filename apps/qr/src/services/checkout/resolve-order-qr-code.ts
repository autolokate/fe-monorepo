import type { CreateQrOrderBody } from '@autolokate/api-client';

import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';

/**
 * QR `code` for POST /v1/orders and POST /v1/promos/validate.
 * URL first, then sessionStorage backup.
 */
export function resolveOrderQrCode(searchParams?: URLSearchParams): string | null {
  return resolvePurchaseQrCode(searchParams);
}

/** Loggable snapshot of CreateOrderBodyDto — matches OpenAPI field names exactly. */
export function formatCreateOrderBodyForLog(body: CreateQrOrderBody): CreateQrOrderBody {
  return { ...body };
}
