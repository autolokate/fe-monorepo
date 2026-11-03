import { useQuery } from '@tanstack/react-query';

import { partnersQueryKeys } from '@/hooks/partners/partners-query-keys';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { fetchAdminGarageRequest } from '@/services/partners/admin-partners-service';
import { describePartnersReadError } from '@/services/partners/partners-errors';

/** Garage request detail — the only read that carries signed photo URLs (quotes v4). */
export function useGarageRequestDetail(id: string | null) {
  const canRead = useAdminPermission('partners:read');
  const query = useQuery({
    queryKey: partnersQueryKeys.garageRequestDetail(id ?? ''),
    queryFn: ({ signal }) => fetchAdminGarageRequest(id ?? '', signal),
    enabled: canRead && Boolean(id),
    retry: false,
    // Photo URLs are signed for ~300 s; always refetch rather than show expired links.
    staleTime: 0,
    gcTime: 60_000,
  });
  return {
    detail: query.data ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    userErrorMessage: query.isError ? describePartnersReadError(query.error) : null,
    refresh: () => {
      void query.refetch();
    },
  };
}
