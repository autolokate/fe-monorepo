import type { AdminPartnerOrgDto, AdminPartnerType } from '@autolokate/api-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  PARTNERS_LIST_LIMIT,
  partnersQueryKeys,
  type PartnersDirectoryListParams,
} from '@/hooks/partners/partners-query-keys';
import { useDebouncedValue } from '@/hooks/discovery/useDebouncedValue';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchAdminPartnersPage } from '@/services/partners/admin-partners-service';
import { describePartnersReadError } from '@/services/partners/partners-errors';

export function usePartnersDirectory(initialType: AdminPartnerType = 'GARAGE') {
  const canRead = useAdminPermission('partners:read');
  const [type, setType] = useState<AdminPartnerType>(initialType);
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search.trim(), 300);

  const params = useMemo<PartnersDirectoryListParams>(() => ({ type, q }), [type, q]);

  const query = useInfiniteQuery({
    queryKey: partnersQueryKeys.directoryList(params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchAdminPartnersPage(
        {
          type,
          ...(q ? { q } : {}),
          limit: PARTNERS_LIST_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load partners.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'partners:directory', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const partners = useMemo<AdminPartnerOrgDto[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const lastPagination = query.data?.pages.at(-1)?.pagination ?? null;
  const mayBeTruncated =
    !query.hasNextPage && lastPagination === null && partners.length >= PARTNERS_LIST_LIMIT;

  return {
    ...query,
    partners,
    mayBeTruncated,
    type,
    setType,
    search,
    setSearch,
    userErrorMessage: query.isError ? describePartnersReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
