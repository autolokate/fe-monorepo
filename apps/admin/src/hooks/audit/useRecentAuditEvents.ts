import { useQuery } from '@tanstack/react-query';

import { auditQueryKeys, RECENT_AUDIT_PARAMS } from '@/hooks/audit/audit-query-keys';
import { fetchAuditEvents } from '@/services/audit/audit-events-service';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

/**
 * Latest audit page. `GET /admin/v1/audit-events` records an AUDIT_EXPORTED row per call, so callers
 * pass `enabled` and read it only on an explicit operator action (e.g. opening the activity panel).
 */
export function useRecentAuditEvents(enabled = true) {
  const canView = useAdminPermission('audit:view');

  return useQuery({
    queryKey: auditQueryKeys.list(RECENT_AUDIT_PARAMS),
    queryFn: ({ signal }) => fetchAuditEvents(RECENT_AUDIT_PARAMS, signal),
    enabled: canView && enabled,
    staleTime: 60_000,
    meta: { errorMessage: 'Unable to load recent activity.' },
  });
}
