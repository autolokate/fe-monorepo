import { useMutation } from '@tanstack/react-query';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import {
  submitGarageFreeBidsAdjust,
  submitGaragePassGrant,
  submitGarageProvision,
} from '@/services/garage/garage-entitlement-service';

export function useGarageEntitlementMutations() {
  const grantPassMutation = useMutation({
    mutationFn: ({
      orgId,
      body,
      signal,
    }: {
      orgId: string;
      body: Parameters<typeof submitGaragePassGrant>[1];
      signal?: AbortSignal;
    }) => submitGaragePassGrant(orgId, body, signal),
    retry: 0,
    onSuccess: () => {
      showSuccessToast('Garage pass granted.');
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'garage-pass-grant', toast: true });
    },
  });

  const adjustFreeBidsMutation = useMutation({
    mutationFn: ({
      orgId,
      body,
      signal,
    }: {
      orgId: string;
      body: Parameters<typeof submitGarageFreeBidsAdjust>[1];
      signal?: AbortSignal;
    }) => submitGarageFreeBidsAdjust(orgId, body, signal),
    retry: 0,
    onSuccess: () => {
      showSuccessToast('Free bids adjusted.');
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'garage-free-bids-adjust', toast: true });
    },
  });

  const provisionGarageMutation = useMutation({
    mutationFn: ({
      body,
      signal,
    }: {
      body: Parameters<typeof submitGarageProvision>[0];
      signal?: AbortSignal;
    }) => submitGarageProvision(body, signal),
    retry: 0,
    onSuccess: () => {
      showSuccessToast('Garage partner provisioned.');
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'garage-provision', toast: true });
    },
  });

  return {
    grantPassMutation,
    adjustFreeBidsMutation,
    provisionGarageMutation,
    mapMutationError: mapAdminApiError,
  };
}
