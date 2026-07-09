import type { CreateOrderBody } from '@autolokate/api-client';

import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code.js';

/**
 * QR `code` for POST /v1/orders (CreateOrderBodyDto.code).
 * URL first, then localStorage backup.
 */
export function resolveOrderQrCode(searchParams?: URLSearchParams): string | null {
  return resolvePurchaseQrCode(searchParams);
}

/** Loggable snapshot of CreateOrderBodyDto — matches OpenAPI field names exactly. */
export function formatCreateOrderBodyForLog(body: CreateOrderBody): CreateOrderBody {
  return { ...body };
}
