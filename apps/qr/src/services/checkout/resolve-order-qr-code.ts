import type { CreateOrderBody } from '@autolokate/api-client';

import { resolvePurchaseQrCode } from '@/platform/qr/resolve-purchase-qr-code';

/**
 * QR `code` for POST /v1/cart (CreateCartBodyDto.code).
 * URL first, then sessionStorage backup.
 */
export function resolveOrderQrCode(searchParams?: URLSearchParams): string | null {
  return resolvePurchaseQrCode(searchParams);
}

/** Loggable snapshot of CreateOrderBodyDto — matches OpenAPI field names exactly. */
export function formatCreateOrderBodyForLog(body: CreateOrderBody): CreateOrderBody {
  return { ...body };
}
