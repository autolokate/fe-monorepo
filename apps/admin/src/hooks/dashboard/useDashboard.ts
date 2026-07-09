import { useQueries } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { dashboardQueryDefinitions } from '@/hooks/dashboard/dashboard-query-definitions';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { computeDashboardMetrics } from '@/services/dashboard/dashboard-metrics';
import type { DashboardSnapshot } from '@/services/dashboard/dashboard-service';

export function useDashboard() {
  const [inventoryQuery, promosQuery, auditQuery] = useQueries({
    queries: [...dashboardQueryDefinitions],
  });

  const isLoading = inventoryQuery.isLoading || promosQuery.isLoading || auditQuery.isLoading;
  const isFetching = inventoryQuery.isFetching || promosQuery.isFetching || auditQuery.isFetching;
  const isError = inventoryQuery.isError || promosQuery.isError || auditQuery.isError;
  const error = inventoryQuery.error ?? promosQuery.error ?? auditQuery.error;

  const data = useMemo((): DashboardSnapshot | undefined => {
    if (!inventoryQuery.data || !promosQuery.data || !auditQuery.data) {
      return undefined;
    }
    return {
      inventory: inventoryQuery.data,
      promos: promosQuery.data,
      recentAuditEvents: auditQuery.data,
    };
  }, [auditQuery.data, inventoryQuery.data, promosQuery.data]);

  useEffect(() => {
    if (isError && data) {
      reportAdminApiError(error, { context: 'dashboard', toast: true });
    }
  }, [data, error, isError]);

  const metrics = useMemo(() => (data ? computeDashboardMetrics(data) : null), [data]);

  const userErrorMessage = isError ? mapAdminApiError(error).userMessage : null;

  return {
    data,
    metrics,
    isLoading,
    isFetching,
    isError,
    error,
    userErrorMessage,
    refresh: () => {
      void inventoryQuery.refetch();
      void promosQuery.refetch();
      void auditQuery.refetch();
    },
  };
}
