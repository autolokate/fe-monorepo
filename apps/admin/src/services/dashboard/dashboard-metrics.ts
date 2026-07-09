import type { DashboardSnapshot } from '@/services/dashboard/dashboard-service';

export type DashboardMetrics = {
  batchCount: number;
  provisionedCodes: number;
  inDistributionBatches: number;
  activePromos: number;
};

export function computeDashboardMetrics(snapshot: DashboardSnapshot): DashboardMetrics {
  const provisionedCodes = snapshot.inventory.reduce((sum, batch) => sum + batch.provisionedCount, 0);
  const inDistributionBatches = snapshot.inventory.filter((batch) => batch.status === 'IN_DISTRIBUTION').length;
  const activePromos = snapshot.promos.filter((promo) => promo.active).length;

  return {
    batchCount: snapshot.inventory.length,
    provisionedCodes,
    inDistributionBatches,
    activePromos,
  };
}
