import {
  getAdminQueueStats,
  listAdminTaxiRefunds,
  type AdminPlanDto,
  type AdminPromoDto,
  type AdminQueueStatsDto,
  type AdminTaxiRefundQueueDto,
  type AdminV4Page,
  type QrInventoryPageResult,
  type SkuSummaryDto,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';
import { fetchAdminPlans, fetchCatalogSkus } from '@/services/catalog/admin-catalog-service';
import { INVENTORY_PAGE_LIMIT } from '@/services/inventory/inventory-metrics';
import { fetchQrInventoryPage } from '@/services/inventory/inventory-service';
import { fetchAdminPromos } from '@/services/promos/admin-promos-service';

export type DashboardSnapshot = {
  /** First (newest) inventory page — `pagination.hasMore` says whether counts are partial. */
  inventory: QrInventoryPageResult;
  promos: AdminPromoDto[];
  plans: AdminPlanDto[] | null;
  skus: SkuSummaryDto[] | null;
};

export async function fetchDashboardSnapshot(signal?: AbortSignal): Promise<DashboardSnapshot> {
  const [inventory, promos, plansResult, skusResult] = await Promise.allSettled([
    fetchQrInventoryPage({ limit: INVENTORY_PAGE_LIMIT }, signal),
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

/** GET /admin/v1/stats/queues — exact queue counters (no PII, not audited). */
export async function fetchQueueStats(signal?: AbortSignal): Promise<AdminQueueStatsDto> {
  return getAdminQueueStats(getAdminApiClient(), { signal });
}

/** First page of the taxi refunds queue (server default = FAILED + NEEDS_RECONCILIATION). */
export async function fetchTaxiRefundsNeedingActionPage(
  limit: number,
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminTaxiRefundQueueDto>> {
  return listAdminTaxiRefunds(getAdminApiClient(), { limit }, { signal });
}
