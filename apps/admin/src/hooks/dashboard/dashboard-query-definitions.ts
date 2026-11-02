import { catalogQueryKeys } from '@/hooks/catalog/catalog-query-keys';
import { inventoryQueryKeys } from '@/hooks/inventory/useQrInventory';
import { promosQueryKeys } from '@/hooks/promos/promo-query-keys';
import { fetchAdminPlans, fetchCatalogSkus } from '@/services/catalog/admin-catalog-service';
import { fetchQrInventory } from '@/services/inventory/inventory-service';
import { fetchAdminPromos } from '@/services/promos/admin-promos-service';

/**
 * No audit-events read here: `GET /admin/v1/audit-events` writes an AUDIT_EXPORTED row on every call,
 * so reading it on each app load / dashboard view flooded the Activity log with the operator's own
 * reads. The Activity log page reads it on purpose.
 */
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
    queryKey: catalogQueryKeys.plansList('ALL'),
    queryFn: ({ signal }: { signal: AbortSignal }) => fetchAdminPlans({}, signal),
    meta: { errorMessage: 'Unable to load catalog plans.' },
  },
  {
    queryKey: catalogQueryKeys.skusList({ channel: 'ALL', includeInactive: true }),
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      fetchCatalogSkus({ includeInactive: true }, signal),
    meta: { errorMessage: 'Unable to load catalog SKUs.' },
  },
] as const;
