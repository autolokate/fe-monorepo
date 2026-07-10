import type { QrCodeStatus } from '@autolokate/api-client';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import {
  BATCH_CODES_PAGE_LIMIT,
  qrBatchCodesQueryKeys,
} from '@/hooks/qr-batches/qr-batch-codes-query-keys';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchQrBatchCodesPage } from '@/services/qr-batches/qr-batch-codes-service';

export function useQrBatchCodes(
  batchId: string | null,
  statusFilter: QrCodeStatus | 'ALL',
  enabled: boolean,
) {
  const queryParams = useMemo(
    () => ({
      ...(statusFilter === 'ALL' ? {} : { status: statusFilter }),
      limit: BATCH_CODES_PAGE_LIMIT,
    }),
    [statusFilter],
  );

  const query = useInfiniteQuery({
    queryKey: batchId
      ? qrBatchCodesQueryKeys.list(batchId, queryParams)
      : [...qrBatchCodesQueryKeys.all, 'idle'],
    queryFn: ({ pageParam, signal }) => {
      if (!batchId) {
        throw new Error('batchId required');
      }
      return fetchQrBatchCodesPage(
        batchId,
        {
          ...queryParams,
          ...(pageParam ? { cursor: pageParam } : {}),
        },
        signal,
      );
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasMore) {
        return undefined;
      }
      return lastPage.pagination.nextCursor ?? undefined;
    },
    enabled: Boolean(batchId) && enabled,
    meta: { errorMessage: 'Unable to load batch codes.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'qr-batch-codes', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const codes = useMemo(
    () => query.data?.pages.flatMap((page) => page.codes) ?? [],
    [query.data],
  );

  const latestPage = query.data?.pages.at(-1);
  const hasMore = latestPage?.pagination?.hasMore ?? false;

  return {
    codes,
    hasMore,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
    loadOlder: () => {
      void query.fetchNextPage();
    },
  };
}
