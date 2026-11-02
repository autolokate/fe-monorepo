import { useQueries } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { dashboardQueryDefinitions } from '@/hooks/dashboard/dashboard-query-definitions';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { computeDashboardMetrics } from '@/services/dashboard/dashboard-metrics';
import type { DashboardSnapshot } from '@/services/dashboard/dashboard-service';

export function useDashboard() {
  const [inventoryQuery, promosQuery, plansQuery, skusQuery] = useQueries({
    queries: [...dashboardQueryDefinitions],
  });

  const isLoading = inventoryQuery.isLoading || promosQuery.isLoading;
  const isFetching =
    inventoryQuery.isFetching ||
    promosQuery.isFetching ||
    plansQuery.isFetching ||
    skusQuery.isFetching;

  const coreError = inventoryQuery.error ?? promosQuery.error ?? null;
  const isCoreError = inventoryQuery.isError || promosQuery.isError;

  const data = useMemo((): DashboardSnapshot | undefined => {
    if (!inventoryQuery.data || !promosQuery.data) {
      return undefined;
    }
    return {
      inventory: inventoryQuery.data,
      promos: promosQuery.data,
      plans: plansQuery.data ?? null,
      skus: skusQuery.data ?? null,
    };
  }, [inventoryQuery.data, plansQuery.data, promosQuery.data, skusQuery.data]);

  useEffect(() => {
    if (isCoreError && data) {
      reportAdminApiError(coreError, { context: 'dashboard', toast: true });
    }
  }, [coreError, data, isCoreError]);

  const metrics = useMemo(() => (data ? computeDashboardMetrics(data) : null), [data]);

  const userErrorMessage = isCoreError ? mapAdminApiError(coreError).userMessage : null;

  return {
    data,
    metrics,
    isLoading,
    isFetching,
    isError: isCoreError,
    error: coreError,
    userErrorMessage,
    refresh: () => {
      void inventoryQuery.refetch();
      void promosQuery.refetch();
      void plansQuery.refetch();
      void skusQuery.refetch();
    },
  };
}
