import { dashboardQueryDefinitions } from '@/hooks/dashboard/dashboard-query-definitions.js';
import { queryClient } from '@/providers/QueryProvider.js';

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
  ]);
}
