import type { AdminPromoDto, AuditEventDto, BatchSummaryDto } from '@autolokate/api-client';

import { RECENT_AUDIT_PARAMS } from '@/hooks/audit/audit-query-keys.js';
import { fetchAuditEvents } from '@/services/audit/audit-events-service.js';
import { fetchQrInventory } from '@/services/inventory/inventory-service.js';
import { fetchAdminPromos } from '@/services/promos/admin-promos-service.js';

export type DashboardSnapshot = {
  inventory: BatchSummaryDto[];
  promos: AdminPromoDto[];
  recentAuditEvents: AuditEventDto[];
};

export async function fetchDashboardSnapshot(signal?: AbortSignal): Promise<DashboardSnapshot> {
  const [inventory, promos, recentAuditEvents] = await Promise.all([
    fetchQrInventory({}, signal),
    fetchAdminPromos(signal),
    fetchAuditEvents(RECENT_AUDIT_PARAMS, signal),
  ]);
  return { inventory, promos, recentAuditEvents };
}
