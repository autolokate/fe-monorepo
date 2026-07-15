import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import {
  toShipmentsQueryStatus,
  type ShipmentsStatusFilter,
} from '@/features/shipments/shipments-filters';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchShipmentsPage } from '@/services/shipments/shipments-service';

export const shipmentsQueryKeys = {
  all: ['admin', 'shipments'] as const,
  list: (statusFilter: ShipmentsStatusFilter) =>
    [...shipmentsQueryKeys.all, { status: toShipmentsQueryStatus(statusFilter) }] as const,
};

export function useShipments(initialStatusFilter: ShipmentsStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useState<ShipmentsStatusFilter>(initialStatusFilter);

  const query = useQuery({
    queryKey: shipmentsQueryKeys.list(statusFilter),
    queryFn: ({ signal }) =>
      fetchShipmentsPage({ status: toShipmentsQueryStatus(statusFilter) }, signal),
    meta: { errorMessage: 'Unable to load shipments.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'shipments', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const shipments = query.data?.items ?? [];

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    ...query,
    shipments,
    statusFilter,
    setStatusFilter,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
  };
}
