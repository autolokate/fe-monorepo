import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import type { OwnershipClaimStatus, ReviewOwnershipClaimBody } from '@autolokate/api-client';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import {
  fetchOwnershipClaims,
  reviewClaim,
} from '@/services/ownership-claims/ownership-claims-service';

export type OwnershipClaimsStatusFilter = OwnershipClaimStatus | 'ALL';

export const ownershipClaimsQueryKeys = {
  all: ['admin', 'ownership-claims'] as const,
  list: (status: OwnershipClaimsStatusFilter) =>
    [...ownershipClaimsQueryKeys.all, { status }] as const,
};

export function useOwnershipClaims(initial: OwnershipClaimsStatusFilter = 'ALL') {
  const [statusFilter, setStatusFilter] = useState<OwnershipClaimsStatusFilter>(initial);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ownershipClaimsQueryKeys.list(statusFilter),
    queryFn: ({ signal }) =>
      fetchOwnershipClaims(
        statusFilter === 'ALL' ? {} : { status: statusFilter },
        signal,
      ),
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
