import type { AdminDiscoveryReelDto } from '@autolokate/api-client';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import {
  DISCOVERY_LIST_LIMIT,
  discoveryQueryKeys,
  type DiscoveryReelListParams,
} from '@/hooks/discovery/discovery-query-keys';
import { useDebouncedValue } from '@/hooks/discovery/useDebouncedValue';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import {
  fetchDiscoveryReel,
  fetchDiscoveryReelsPage,
} from '@/services/discovery/admin-discovery-service';
import { describeDiscoveryReadError } from '@/services/discovery/discovery-errors';

export function useDiscoveryReels() {
  const canRead = useAdminPermission('discovery:read');
  const [status, setStatus] = useState<DiscoveryReelListParams['status']>('ALL');
  const [sort, setSort] = useState<DiscoveryReelListParams['sort']>('updated');
  const [search, setSearch] = useState('');
  const q = useDebouncedValue(search.trim(), 300);

  const params = useMemo<DiscoveryReelListParams>(() => ({ status, sort, q }), [status, sort, q]);

  const query = useInfiniteQuery({
    queryKey: discoveryQueryKeys.reelsList(params),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchDiscoveryReelsPage(
        {
          ...(status === 'ALL' ? {} : { status }),
          sort,
          ...(q ? { q } : {}),
          limit: DISCOVERY_LIST_LIMIT,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.hasMore ? (lastPage.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead,
    retry: false,
    meta: { errorMessage: 'Unable to load reels.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'discovery:reels', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const reels = useMemo<AdminDiscoveryReelDto[]>(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  const lastPagination = query.data?.pages.at(-1)?.pagination ?? null;
  const mayBeTruncated =
    !query.hasNextPage && lastPagination === null && reels.length >= DISCOVERY_LIST_LIMIT;

  return {
    ...query,
    reels,
    mayBeTruncated,
    status,
    setStatus,
    sort,
    setSort,
    search,
    setSearch,
    userErrorMessage: query.isError ? describeDiscoveryReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}

/** Signed URLs expire after ~5 minutes on the server, so detail reads go stale quickly. */
const SIGNED_URL_STALE_MS = 4 * 60_000;

/**
 * Detail read for one reel — the only admin read that signs `playbackUrl` / `thumbUrl`. Used for list
 * thumbnails and the edit sheet's preview.
 */
export function useDiscoveryReelDetail(reelId: string | null, enabled = true) {
  const canRead = useAdminPermission('discovery:read');
  return useQuery({
    queryKey: discoveryQueryKeys.reelDetail(reelId ?? 'none'),
    queryFn: ({ signal }) => fetchDiscoveryReel(reelId ?? '', signal),
    enabled: canRead && enabled && reelId !== null,
    staleTime: SIGNED_URL_STALE_MS,
    retry: false,
    meta: { errorMessage: 'Unable to load reel preview.' },
  });
}
