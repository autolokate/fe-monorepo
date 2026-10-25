import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { partnersQueryKeys } from '@/hooks/partners/partners-query-keys';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { fetchAdminPartner } from '@/services/partners/admin-partners-service';
import { describePartnersReadError } from '@/services/partners/partners-errors';

export function usePartnerDetail(orgId: string | undefined) {
  const canRead = useAdminPermission('partners:read');

  const query = useQuery({
    queryKey: partnersQueryKeys.detail(orgId ?? ''),
    queryFn: ({ signal }) => {
      if (!orgId) {
        return Promise.reject(new Error('Missing partner orgId'));
      }
      return fetchAdminPartner(orgId, signal);
    },
    enabled: canRead && Boolean(orgId),
    retry: false,
    meta: { errorMessage: 'Unable to load partner.' },
  });

  useEffect(() => {
    if (query.isError) {
      reportAdminApiError(query.error, { context: 'partners:detail', toast: true });
    }
  }, [query.error, query.isError]);

  return {
    ...query,
    partner: query.data ?? null,
    userErrorMessage: query.isError ? describePartnersReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
