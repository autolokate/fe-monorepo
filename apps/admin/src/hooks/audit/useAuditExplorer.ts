import type { AuditExplorerFilters } from '@/features/audit/audit-filters.js';
import { toAuditQueryParams } from '@/features/audit/audit-filters.js';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { auditQueryKeys } from '@/hooks/audit/audit-query-keys.js';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors.js';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error.js';
import { fetchAuditEventsPage } from '@/services/audit/audit-events-service.js';

export function useAuditExplorer(filters: AuditExplorerFilters) {
  const queryParams = useMemo(() => toAuditQueryParams(filters), [filters]);

  const query = useInfiniteQuery({
    queryKey: auditQueryKeys.explorer(queryParams),
    queryFn: ({ pageParam, signal }) =>
      fetchAuditEventsPage(
        {
          ...queryParams,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasMore) {
        return undefined;
      }
      return lastPage.pagination.nextCursor ?? undefined;
    },
    meta: { errorMessage: 'Unable to load audit events.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'audit-events', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const events = useMemo(
    () => query.data?.pages.flatMap((page) => page.events) ?? [],
    [query.data],
  );

  const latestPage = query.data?.pages.at(-1);
  const hasMore = latestPage?.pagination?.hasMore ?? false;
  const requestMeta = latestPage
    ? { requestId: latestPage.requestId, correlationId: latestPage.correlationId }
    : null;

  const userErrorMessage = query.isError ? mapAdminApiError(query.error).userMessage : null;

  return {
    events,
    hasMore,
    requestMeta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    userErrorMessage,
    refresh: () => {
      void query.refetch();
    },
    loadOlder: () => {
      void query.fetchNextPage();
    },
  };
}
