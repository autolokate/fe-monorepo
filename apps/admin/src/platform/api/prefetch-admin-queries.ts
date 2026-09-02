import { catalogQueryKeys } from '@/hooks/catalog/catalog-query-keys';
import { dashboardQueryDefinitions } from '@/hooks/dashboard/dashboard-query-definitions';
import { queryClient } from '@/providers/QueryProvider';
import { fetchAdminPlans, fetchCatalogSkus } from '@/services/catalog/admin-catalog-service';

/** Warm shared React Query caches after authentication. */
export async function prefetchAdminQueries(): Promise<void> {
  const [inventoryDefinition, promosDefinition, auditDefinition] = dashboardQueryDefinitions;

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: inventoryDefinition.queryKey,
      queryFn: inventoryDefinition.queryFn,
      meta: inventoryDefinition.meta,
    }),
    queryClient.prefetchQuery({
      queryKey: promosDefinition.queryKey,
      queryFn: promosDefinition.queryFn,
      meta: promosDefinition.meta,
    }),
    queryClient.prefetchQuery({
      queryKey: auditDefinition.queryKey,
      queryFn: auditDefinition.queryFn,
      meta: auditDefinition.meta,
    }),
    // The catalog's two lists are coupled — the SKU shelf pickers read from the plan list, so warm both.
    queryClient.prefetchQuery({
      queryKey: catalogQueryKeys.plansList('ALL'),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchAdminPlans({}, signal),
      meta: { errorMessage: 'Unable to load plans.' },
    }),
    queryClient.prefetchQuery({
      queryKey: catalogQueryKeys.skusList({ channel: 'ALL', includeInactive: true }),
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchCatalogSkus({ includeInactive: true }, signal),
      meta: { errorMessage: 'Unable to load SKUs.' },
    }),
  ]);
}
