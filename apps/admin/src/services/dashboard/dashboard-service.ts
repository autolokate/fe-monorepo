import type {
  AdminPlanDto,
  AdminPromoDto,
  BatchSummaryDto,
  SkuSummaryDto,
} from '@autolokate/api-client';

import { fetchAdminPlans, fetchCatalogSkus } from '@/services/catalog/admin-catalog-service';
import { fetchQrInventory } from '@/services/inventory/inventory-service';
import { fetchAdminPromos } from '@/services/promos/admin-promos-service';

export type DashboardSnapshot = {
  inventory: BatchSummaryDto[];
  promos: AdminPromoDto[];
  plans: AdminPlanDto[] | null;
  skus: SkuSummaryDto[] | null;
};

export async function fetchDashboardSnapshot(signal?: AbortSignal): Promise<DashboardSnapshot> {
  const [inventory, promos, plansResult, skusResult] = await Promise.allSettled([
    fetchQrInventory({}, signal),
    fetchAdminPromos(signal),
    fetchAdminPlans({}, signal),
    fetchCatalogSkus({ includeInactive: true }, signal),
  ]);

  if (inventory.status === 'rejected') {
    throw inventory.reason;
  }
  if (promos.status === 'rejected') {
    throw promos.reason;
  }

  return {
    inventory: inventory.value,
    promos: promos.value,
    plans: plansResult.status === 'fulfilled' ? plansResult.value : null,
    skus: skusResult.status === 'fulfilled' ? skusResult.value : null,
  };
}
