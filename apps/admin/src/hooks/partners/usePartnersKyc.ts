import type { GarageGstVerification } from '@autolokate/api-client';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { partnersQueryKeys, PARTNERS_LIST_LIMIT } from '@/hooks/partners/partners-query-keys';
import {
  isAdminListNotDeployed,
  mapAdminApiError,
  resolveSubmitErrorMessage,
} from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { submitGarageGstVerification } from '@/services/garage/garage-entitlement-service';
import { fetchAdminPartnersKycPage } from '@/services/partners/admin-partners-service';

export type KycQueueStatus =
  | 'PENDING_REVIEW'
  | 'NEEDS_ATTENTION'
  | 'PENDING'
  | 'VERIFIED'
  | 'NOT_SUBMITTED';

const kycKey = (status: KycQueueStatus) => [...partnersQueryKeys.all, 'kyc', status] as const;

/** ADM-09 — partner KYC (GST) queue + decisions via the existing gst-verification route. */
export function usePartnersKyc() {
  const canRead = useAdminPermission('partners:read');
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<KycQueueStatus>('PENDING_REVIEW');

  const query = useInfiniteQuery({
    queryKey: kycKey(status),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      fetchAdminPartnersKycPage(
        { status, limit: PARTNERS_LIST_LIMIT, ...(pageParam ? { cursor: pageParam } : {}) },
        signal,
      ),
    getNextPageParam: (last) =>
      last.pagination?.hasMore ? (last.pagination.nextCursor ?? undefined) : undefined,
    enabled: canRead,
    retry: false,
  });

  const decide = useMutation({
    mutationFn: (input: { orgId: string; decision: GarageGstVerification }) =>
      submitGarageGstVerification(input.orgId, { gstVerification: input.decision }),
    onSuccess: (_result, input) => {
      showSuccessToast(
        input.decision === 'VERIFIED' ? 'GST marked verified.' : 'GST marked needs attention.',
      );
      void queryClient.invalidateQueries({ queryKey: [...partnersQueryKeys.all, 'kyc'] });
      void queryClient.invalidateQueries({ queryKey: partnersQueryKeys.detail(input.orgId) });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'partners-kyc-decision', toast: false });
    },
  });

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const notDeployed = query.isError && isAdminListNotDeployed(query.error);
  return {
    ...query,
    items,
    status,
    setStatus,
    notDeployed,
    userErrorMessage:
      query.isError && !notDeployed ? mapAdminApiError(query.error).userMessage : null,
    refresh: () => {
      void query.refetch();
    },
    decide,
    decideError: decide.isError ? resolveSubmitErrorMessage(decide.error) : null,
  };
}
