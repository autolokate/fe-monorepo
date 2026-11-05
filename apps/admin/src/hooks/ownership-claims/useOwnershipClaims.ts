import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import type {
  AdminOwnershipClaimDto,
  OwnershipClaimStatus,
  ReviewOwnershipClaimBody,
} from '@autolokate/api-client';

import { isAdminRouteNotDeployed, mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { ADMIN_LIST_PAGE_SIZE } from '@/platform/query/cursor-pages';
import {
  fetchOwnershipClaimsPage,
  fetchOwnershipReviewAccess,
  fetchVehicleOwnershipHistory,
  reviewClaim,
} from '@/services/ownership-claims/ownership-claims-service';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';

/** `PENDING` = every claim still waiting for a decision (SUBMITTED + UNDER_REVIEW) — the dashboard queue. */
export type OwnershipClaimsStatusFilter = OwnershipClaimStatus | 'ALL' | 'PENDING';

const PENDING_CLAIM_STATUSES: OwnershipClaimStatus[] = ['SUBMITTED', 'UNDER_REVIEW'];

/**
 * Keyset position per stream: the list route takes one status, so a filter reads one or more
 * streams (`ALL` = no status). `undefined` = not started, a string = the next cursor, `null` = done.
 */
export type OwnershipClaimsCursor = Readonly<Record<string, string | null>>;

const STREAM_ALL = 'ALL';
const FIRST_PAGE: OwnershipClaimsCursor = {};

function streamsFor(filter: OwnershipClaimsStatusFilter): string[] {
  if (filter === 'PENDING') return PENDING_CLAIM_STATUSES;
  return [filter];
}

export type OwnershipClaimsFilterPage = {
  items: AdminOwnershipClaimDto[];
  /** Undefined once every stream is exhausted. */
  nextCursor: OwnershipClaimsCursor | undefined;
};

/**
 * One page of the claim queue for a filter. `PENDING` reads both open statuses (each with its own
 * keyset cursor) and merges them newest first — the same set `GET /admin/v1/stats/queues` counts.
 */
export async function fetchOwnershipClaimsForFilter(
  filter: OwnershipClaimsStatusFilter,
  cursor: OwnershipClaimsCursor = {},
  signal?: AbortSignal,
): Promise<OwnershipClaimsFilterPage> {
  const streams = streamsFor(filter).filter((stream) => cursor[stream] !== null);
  const pages = await Promise.all(
    streams.map(async (stream) => {
      const position = cursor[stream];
      const page = await fetchOwnershipClaimsPage(
        {
          ...(stream === STREAM_ALL ? {} : { status: stream as OwnershipClaimStatus }),
          limit: ADMIN_LIST_PAGE_SIZE,
          ...(position ? { cursor: position } : {}),
        },
        signal,
      );
      const next = page.pagination?.hasMore ? (page.pagination.nextCursor ?? null) : null;
      return { stream, items: page.items, next };
    }),
  );
  const nextCursor: Record<string, string | null> = { ...cursor };
  for (const page of pages) nextCursor[page.stream] = page.next;
  const items = pages
    .flatMap((page) => page.items)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  const more = streamsFor(filter).some((stream) => nextCursor[stream] !== null);
  return { items, nextCursor: more ? nextCursor : undefined };
}

export const ownershipClaimsQueryKeys = {
  all: ['admin', 'ownership-claims'] as const,
  list: (status: OwnershipClaimsStatusFilter) =>
    [...ownershipClaimsQueryKeys.all, 'list', { status }] as const,
  reviewAccess: ['admin', 'ownership-claims', 'review-access'] as const,
  history: (vehicleId: string | null) =>
    ['admin', 'ownership-claims', 'vehicle-history', vehicleId] as const,
};

/** Every loaded row once (pages of a merged filter can overlap after a decision moves a claim). */
function dedupeClaims(rows: AdminOwnershipClaimDto[]): AdminOwnershipClaimDto[] {
  const seen = new Set<string>();
  return rows.filter((row) => (seen.has(row.id) ? false : (seen.add(row.id), true)));
}

export function useOwnershipClaims(initial: OwnershipClaimsStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useUrlFilterState<OwnershipClaimsStatusFilter>(
    'status',
    initial,
  );
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ownershipClaimsQueryKeys.list(statusFilter),
    queryFn: ({ pageParam, signal }) =>
      fetchOwnershipClaimsForFilter(statusFilter, pageParam, signal),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: (page) => page.nextCursor,
    meta: { errorMessage: 'Unable to load ownership claims.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'ownership-claims', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const claims = useMemo(
    () => dedupeClaims(query.data?.pages.flatMap((page) => page.items) ?? []),
    [query.data],
  );

  const reviewMutation = useMutation({
    mutationFn: (input: { claimId: string; body: ReviewOwnershipClaimBody }) =>
      reviewClaim(input.claimId, input.body),
    // Errors render inside the decision dialog (remarks kept) — no toast.
    // Refresh lists and history, but never the RC link (each fetch is an audited RC view) or the
    // reviewer flag.
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ownershipClaimsQueryKeys.all,
        predicate: (query) => {
          const part = query.queryKey[2];
          return part !== 'rc-proof' && part !== 'review-access';
        },
      });
    },
  });

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    claims,
    hasMore: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore: () => {
      void query.fetchNextPage();
    },
    statusFilter,
    setStatusFilter,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
    reviewMutation,
    refresh: () => {
      void query.refetch();
    },
  };
}

export type OwnershipReviewAccess =
  | { state: 'loading' }
  | { state: 'allowed' }
  /** Not on the server allowlist — or the check failed (fail closed; `errorMessage` says why). */
  | { state: 'denied'; errorMessage: string | null };

/**
 * Whether THIS operator may approve / reject (`GET /admin/v1/ownership-claims/review-access`,
 * D-13 allowlist). Only the server decides; any failure is treated as "not a reviewer".
 */
export function useOwnershipReviewAccess(): OwnershipReviewAccess {
  const query = useQuery({
    queryKey: ownershipClaimsQueryKeys.reviewAccess,
    queryFn: ({ signal }) => fetchOwnershipReviewAccess(signal),
    retry: false,
    staleTime: 60_000,
  });
  if (query.isLoading) return { state: 'loading' };
  if (query.isError) {
    return {
      state: 'denied',
      errorMessage: isAdminRouteNotDeployed(query.error)
        ? 'The server does not report reviewer access yet, so decisions stay disabled.'
        : mapAdminApiError(query.error).userMessage,
    };
  }
  return query.data?.canDecide === true
    ? { state: 'allowed' }
    : { state: 'denied', errorMessage: null };
}

/** Per-vehicle ownership timeline (`GET /admin/v1/vehicles/{vehicleId}/ownership-history`). */
export function useVehicleOwnershipHistory(vehicleId: string | null) {
  const enabled = typeof vehicleId === 'string' && vehicleId.length > 0;
  const query = useQuery({
    queryKey: ownershipClaimsQueryKeys.history(vehicleId),
    queryFn: ({ signal }) => {
      if (!vehicleId) throw new Error('vehicleId required');
      return fetchVehicleOwnershipHistory(vehicleId, signal);
    },
    enabled,
    retry: false,
  });
  const notDeployed = isAdminRouteNotDeployed(query.error);
  return {
    rows: query.data ?? [],
    isLoading: enabled && query.isLoading,
    notDeployed,
    errorMessage: query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refetch: () => query.refetch(),
  };
}

/**
 * Recent claims across every status (first 100, newest first) — used for the claimant's attempt
 * history and for other claims on the same plate. The API has no per-vehicle claim endpoint, so the
 * view says when this window may be incomplete.
 */
export function useRecentOwnershipClaims(enabled: boolean) {
  const query = useQuery({
    queryKey: [...ownershipClaimsQueryKeys.all, 'recent'],
    queryFn: ({ signal }) => fetchOwnershipClaimsPage({ limit: 100 }, signal),
    enabled,
    meta: { errorMessage: 'Unable to load ownership claims.' },
  });
  return {
    claims: query.data?.items ?? [],
    truncated: query.data?.pagination?.hasMore === true,
    isLoading: enabled && query.isLoading,
    errorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
  };
}
