'use client';

import { getOrder, type OrderTracking } from '@/services/purchase';
import { useApiQuery } from '@/hooks/useApiQuery';

/** `GET /v1/orders/:id` — order status + shipping fulfillment for the tracking screen. */
export function useOrderTracking(orderId: string | null) {
  return useApiQuery<OrderTracking | null>(
    () => (orderId ? getOrder(orderId) : Promise.resolve(null)),
    [orderId],
    { enabled: Boolean(orderId), initialData: null },
  );
}
