'use client';

import { listOrders, type OrderSummary } from '@/services/purchase';
import { useApiQuery } from '@/hooks/useApiQuery';

/** `GET /v1/orders` — the buyer's order history for the my-orders screen. */
export function useOrders(limit = 20, enabled = true) {
  return useApiQuery<OrderSummary[]>(
    () => (enabled ? listOrders(limit) : Promise.resolve([])),
    [limit, enabled],
    { enabled, initialData: [] },
  );
}
