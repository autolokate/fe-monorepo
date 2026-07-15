import type {
  AdminPlanDto,
  AdminPromoDto,
  AuditEventDto,
  BatchSummaryDto,
  SkuSummaryDto,
} from '@autolokate/api-client';

import { RECENT_AUDIT_PARAMS } from '@/hooks/audit/audit-query-keys';
import { fetchAdminPlans, fetchCatalogSkus } from '@/services/catalog/admin-catalog-service';
import { fetchAuditEvents } from '@/services/audit/audit-events-service';
import { fetchQrInventory } from '@/services/inventory/inventory-service';
import { fetchAdminPromos } from '@/services/promos/admin-promos-service';

export type DashboardSnapshot = {
  inventory: BatchSummaryDto[];
  promos: AdminPromoDto[];
  recentAuditEvents: AuditEventDto[];
  plans: AdminPlanDto[] | null;
  skus: SkuSummaryDto[] | null;
};

export async function fetchDashboardSnapshot(signal?: AbortSignal): Promise<DashboardSnapshot> {
  const [inventory, promos, recentAuditEvents, plansResult, skusResult] = await Promise.allSettled([
    fetchQrInventory({}, signal),
    fetchAdminPromos(signal),
    fetchAuditEvents(RECENT_AUDIT_PARAMS, signal),
    fetchAdminPlans({}, signal),
    fetchCatalogSkus({ includeInactive: true }, signal),
  ]);

  if (inventory.status === 'rejected') {
    throw inventory.reason;
  }
  if (promos.status === 'rejected') {
    throw promos.reason;
  }
  if (recentAuditEvents.status === 'rejected') {
    throw recentAuditEvents.reason;
  }

  return {
    inventory: inventory.value,
    promos: promos.value,
    recentAuditEvents: recentAuditEvents.value,
    plans: plansResult.status === 'fulfilled' ? plansResult.value : null,
    skus: skusResult.status === 'fulfilled' ? skusResult.value : null,
  };
}
