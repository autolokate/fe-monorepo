import { useQuery } from '@tanstack/react-query';

import { auditQueryKeys, RECENT_AUDIT_PARAMS } from '@/hooks/audit/audit-query-keys';
import { fetchAuditEvents } from '@/services/audit/audit-events-service';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

export function useRecentAuditEvents() {
  const canView = useAdminPermission('audit:view');

  return useQuery({
    queryKey: auditQueryKeys.list(RECENT_AUDIT_PARAMS),
    queryFn: ({ signal }) => fetchAuditEvents(RECENT_AUDIT_PARAMS, signal),
    enabled: canView,
    staleTime: 60_000,
    meta: { errorMessage: 'Unable to load recent activity.' },
  });
}
