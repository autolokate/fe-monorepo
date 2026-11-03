import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import type { OwnershipClaimStatus, ReviewOwnershipClaimBody } from '@autolokate/api-client';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import {
  fetchOwnershipClaims,
  reviewClaim,
} from '@/services/ownership-claims/ownership-claims-service';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';

/** `PENDING` = every claim still waiting for a decision (SUBMITTED + UNDER_REVIEW) — the dashboard queue. */
export type OwnershipClaimsStatusFilter = OwnershipClaimStatus | 'ALL' | 'PENDING';

const PENDING_CLAIM_STATUSES: OwnershipClaimStatus[] = ['SUBMITTED', 'UNDER_REVIEW'];

/**
 * The list route takes one status, so `PENDING` reads both open statuses and merges them newest
 * first — the same set `GET /admin/v1/stats/queues` counts as `ownershipClaimsPending`.
 */
export async function fetchOwnershipClaimsForFilter(
  filter: OwnershipClaimsStatusFilter,
  signal?: AbortSignal,
) {
  if (filter === 'ALL') return fetchOwnershipClaims({}, signal);
  if (filter !== 'PENDING') return fetchOwnershipClaims({ status: filter }, signal);
  const pages = await Promise.all(
    PENDING_CLAIM_STATUSES.map((status) => fetchOwnershipClaims({ status }, signal)),
  );
  return pages.flat().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export const ownershipClaimsQueryKeys = {
  all: ['admin', 'ownership-claims'] as const,
  list: (status: OwnershipClaimsStatusFilter) =>
    [...ownershipClaimsQueryKeys.all, { status }] as const,
};

export function useOwnershipClaims(initial: OwnershipClaimsStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useUrlFilterState<OwnershipClaimsStatusFilter>(
    'status',
    initial,
  );
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ownershipClaimsQueryKeys.list(statusFilter),
    queryFn: ({ signal }) => fetchOwnershipClaimsForFilter(statusFilter, signal),
    meta: { errorMessage: 'Unable to load ownership claims.' },
  });

  useEffect(() => {
    if (query.isError && query.data) {
      reportAdminApiError(query.error, { context: 'ownership-claims', toast: true });
    }
  }, [query.data, query.error, query.isError]);

  const reviewMutation = useMutation({
    mutationFn: (input: { claimId: string; body: ReviewOwnershipClaimBody }) =>
      reviewClaim(input.claimId, input.body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ownershipClaimsQueryKeys.all });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'ownership-claims-review', toast: true });
    },
  });

  return {
    ...query,
    claims: query.data ?? [],
    statusFilter,
    setStatusFilter,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
    reviewMutation,
    refresh: () => {
      void query.refetch();
    },
  };
}

/**
 * Every claim (no status filter) — shares the `ALL` list cache. Used to show a claimant's
 * resubmission history for one vehicle; the API has no per-vehicle claim history endpoint.
 */
export function useAllOwnershipClaims(enabled: boolean) {
  const query = useQuery({
    queryKey: ownershipClaimsQueryKeys.list('ALL'),
    queryFn: ({ signal }) => fetchOwnershipClaims({}, signal),
    enabled,
    meta: { errorMessage: 'Unable to load ownership claims.' },
  });
  return {
    claims: query.data ?? [],
    isLoading: enabled && query.isLoading,
    errorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
  };
}
