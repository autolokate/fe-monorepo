import type { DashboardSnapshot } from '@/services/dashboard/dashboard-service';
import { computeCatalogMetrics, type CatalogMetrics } from '@/services/catalog/catalog-model';
import {
  computeInventoryMetrics,
  type InventoryMetrics,
} from '@/services/inventory/inventory-metrics';
import { computePromoMetrics, type PromoMetrics } from '@/services/promos/promo-metrics';
import {
  computeBatchManagementMetrics,
  type BatchManagementMetrics,
} from '@/services/qr-batches/batch-lifecycle';

export type DashboardMetrics = {
  inventory: InventoryMetrics;
  batchManagement: BatchManagementMetrics;
  promos: PromoMetrics;
  catalog: CatalogMetrics | null;
  /** Size of the latest audit feed page (API limit), not total audit history. */
  auditLatestCount: number;
};

export function computeDashboardMetrics(snapshot: DashboardSnapshot): DashboardMetrics {
  return {
    inventory: computeInventoryMetrics(snapshot.inventory),
    batchManagement: computeBatchManagementMetrics(snapshot.inventory),
    promos: computePromoMetrics(snapshot.promos),
    catalog:
      snapshot.plans && snapshot.skus ? computeCatalogMetrics(snapshot.plans, snapshot.skus) : null,
    auditLatestCount: snapshot.recentAuditEvents.length,
  };
}
