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
};

export function computeDashboardMetrics(snapshot: DashboardSnapshot): DashboardMetrics {
  return {
    inventory: computeInventoryMetrics(
      snapshot.inventory.items,
      snapshot.inventory.pagination?.hasMore === true,
    ),
    batchManagement: computeBatchManagementMetrics(
      snapshot.inventory.items,
      snapshot.inventory.pagination?.hasMore === true,
    ),
    promos: computePromoMetrics(snapshot.promos),
    catalog:
      snapshot.plans && snapshot.skus ? computeCatalogMetrics(snapshot.plans, snapshot.skus) : null,
  };
}
