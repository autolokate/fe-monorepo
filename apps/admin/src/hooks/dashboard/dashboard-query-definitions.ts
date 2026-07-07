import { RECENT_AUDIT_PARAMS, auditQueryKeys } from '@/hooks/audit/audit-query-keys.js';
import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory.js';
import { promosQueryKeys } from '@/hooks/promos/promo-query-keys.js';
import { fetchAuditEvents } from '@/services/audit/audit-events-service.js';
import { fetchQrInventory } from '@/services/inventory/inventory-service.js';
import { fetchAdminPromos } from '@/services/promos/admin-promos-service.js';

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
