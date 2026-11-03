import { ADMIN_RAS_STATUSES, type AdminRasStatus } from '@autolokate/api-client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { isAdminListNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { nextCursorOf } from '@/platform/query/cursor-pages';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';
import {
  fetchRasRequest,
  fetchRasRequestsPage,
  RAS_PAGE_LIMIT,
} from '@/services/roadside/roadside-service';

export type RasStatusFilter = AdminRasStatus | 'ALL';

const RAS_STATUS_VALUES: readonly RasStatusFilter[] = ['ALL', ...ADMIN_RAS_STATUSES];

export const roadsideQueryKeys = {
  all: ['admin', 'roadside'] as const,
  list: (status: RasStatusFilter) => [...roadsideQueryKeys.all, 'list', status] as const,
  detail: (id: string) => [...roadsideQueryKeys.all, 'detail', id] as const,
};

export function useRoadsideRequests() {
  const canRead = useAdminPermission('support:view');
  const [status, setStatus] = useUrlFilterState<RasStatusFilter>(
    'status',
    'ALL',
    RAS_STATUS_VALUES,
  );
  const query = useInfiniteQuery({
    queryKey: roadsideQueryKeys.list(status),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchRasRequestsPage(
        {
          ...(status === 'ALL' ? {} : { status }),
          limit: RAS_PAGE_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: nextCursorOf,
    enabled: canRead,
    retry: false,
  });
  const requests = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    ...query,
    requests,
    status,
    setStatus,
    notDeployed,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

export function useRoadsideRequest(id: string | null) {
  const query = useQuery({
    queryKey: roadsideQueryKeys.detail(id ?? 'none'),
    queryFn: ({ signal }) => fetchRasRequest(id ?? '', signal),
    enabled: id !== null,
    retry: false,
  });
  return {
    ...query,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
  };
}
