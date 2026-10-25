import type { AdminGarageRequestInboxDto, AdminGarageRequestStatus } from '@autolokate/api-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  PARTNERS_LIST_LIMIT,
  partnersQueryKeys,
  type GarageRequestsListParams,
} from '@/hooks/partners/partners-query-keys';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchAdminGarageRequestsPage } from '@/services/partners/admin-partners-service';
import { describePartnersReadError } from '@/services/partners/partners-errors';

export function useGarageRequestsInbox() {
  const canRead = useAdminPermission('partners:read');
  const [status, setStatus] = useState<AdminGarageRequestStatus | 'ALL'>('ALL');

  const params = useMemo<GarageRequestsListParams>(() => ({ status }), [status]);

  const query = useInfiniteQuery({
    queryKey: partnersQueryKeys.garageRequestsList(params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchAdminGarageRequestsPage(
        {
          ...(status === 'ALL' ? {} : { status }),
          limit: PARTNERS_LIST_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load garage requests.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'partners:garage-requests', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const requests = useMemo<AdminGarageRequestInboxDto[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return {
    ...query,
    requests,
    status,
    setStatus,
    userErrorMessage: query.isError ? describePartnersReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
