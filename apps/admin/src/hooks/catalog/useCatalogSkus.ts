import type { QrBatchChannel } from '@autolokate/api-client';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { catalogQueryKeys } from '@/hooks/catalog/catalog-query-keys';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchCatalogSkus } from '@/services/catalog/admin-catalog-service';

export type SkuChannelFilter = QrBatchChannel | 'ALL';

/**
 * The catalog console lists inactive Skus by default: `active` only gates NEW batches, so an inactive Sku
 * whose stickers are still on shelves is very much a thing you need to be able to see and edit.
 */
export function useCatalogSkus(
  initialChannelFilter: SkuChannelFilter = 'ALL',
  initialIncludeInactive = true,
) {
  const [channelFilter, setChannelFilter] = useState<SkuChannelFilter>(initialChannelFilter);
  const [includeInactive, setIncludeInactive] = useState(initialIncludeInactive);

  const params = useMemo(
    () => ({ channel: channelFilter, includeInactive }),
    [channelFilter, includeInactive],
  );

  const query = useQuery({
    queryKey: catalogQueryKeys.skusList(params),
    queryFn: ({ signal }) =>
      fetchCatalogSkus(
        {
          ...(channelFilter === 'ALL' ? {} : { channel: channelFilter }),
          includeInactive,
        },
        signal,
      ),
    meta: { errorMessage: 'Unable to load SKUs.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'catalog:skus', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const skus = useMemo(() => query.data ?? [], [query.data]);
  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    skus,
    channelFilter,
    setChannelFilter,
    includeInactive,
    setIncludeInactive,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
