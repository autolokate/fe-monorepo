import { RECENT_AUDIT_PARAMS, auditQueryKeys } from '@/hooks/audit/audit-query-keys';
import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory';
import { promosQueryKeys } from '@/hooks/promos/promo-query-keys';
import { fetchAuditEvents } from '@/services/audit/audit-events-service';
import { fetchQrInventory } from '@/services/inventory/inventory-service';
import { fetchAdminPromos } from '@/services/promos/admin-promos-service';

export const dashboardQueryDefinitions = [
  {
    queryKey: inventoryQueryKeys.list('ALL'),
    queryFn: ({ signal }: { signal: AbortSignal }) => fetchQrInventory({}, signal),
    meta: { errorMessage: 'Unable to load QR inventory.' },
  },
  {
    queryKey: promosQueryKeys.list(),
    queryFn: ({ signal }: { signal: AbortSignal }) => fetchAdminPromos(signal),
    meta: { errorMessage: 'Unable to load promos.' },
  },
  {
    queryKey: auditQueryKeys.list(RECENT_AUDIT_PARAMS),
    queryFn: ({ signal }: { signal: AbortSignal }) => fetchAuditEvents(RECENT_AUDIT_PARAMS, signal),
    meta: { errorMessage: 'Unable to load audit events.' },
  },
] as const;
