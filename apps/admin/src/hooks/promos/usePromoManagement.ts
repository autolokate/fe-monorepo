import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  filterPromosByStatus,
  type PromoStatusFilter,
} from '@/features/promos/promo-filters';
import { promosQueryKeys } from '@/hooks/promos/promo-query-keys';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchAdminPromos } from '@/services/promos/admin-promos-service';
import { computePromoMetrics } from '@/services/promos/promo-metrics';

export function usePromoManagement(initialStatusFilter: PromoStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useState<PromoStatusFilter>(initialStatusFilter);

  const query = useQuery({
    queryKey: promosQueryKeys.list(),
    queryFn: ({ signal }) => fetchAdminPromos(signal),
    meta: { errorMessage: 'Unable to load promos.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'promos', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const filteredPromos = useMemo(
    () => (query.data ? filterPromosByStatus(query.data, statusFilter) : []),
    [query.data, statusFilter],
  );

  const metrics = useMemo(
    () => (query.data ? computePromoMetrics(query.data) : null),
    [query.data],
  );

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    promos: filteredPromos,
    statusFilter,
    setStatusFilter,
    metrics,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
