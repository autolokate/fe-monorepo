import type { QrBatchChannel } from '@autolokate/api-client';
import { useQuery } from '@tanstack/react-query';

import { fetchSkus } from '@/services/qr-batches/sku-service';

/** Active Skus for one SalesChannel (create-batch picker — never cross-channel). */
export function useSkus(channel: QrBatchChannel, enabled = true) {
  return useQuery({
    queryKey: ['admin', 'skus', channel],
    queryFn: ({ signal }) => fetchSkus({ channel }, signal),
    enabled: enabled && Boolean(channel),
    staleTime: 60_000,
  });
}
