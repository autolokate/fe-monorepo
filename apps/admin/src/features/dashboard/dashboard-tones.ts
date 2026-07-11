export type DashboardTone = 'success' | 'warning' | 'danger' | 'neutral';

/** Positive when value exists, neutral when zero. */
export function toneWhenPositive(value: number): DashboardTone {
  return value > 0 ? 'success' : 'neutral';
}

/** Draft / pipeline work waiting — warn when non-zero, good when clear. */
export function toneWhenPendingWork(value: number): DashboardTone {
  return value > 0 ? 'warning' : 'success';
}

/** Problems — red when non-zero, green when clear. */
export function toneWhenIssue(value: number): DashboardTone {
  return value > 0 ? 'danger' : 'success';
}

export function toneForCatalogSkus(skuCount: number, emptyShelves: number): DashboardTone {
  if (skuCount === 0) {
    return 'danger';
  }
  if (emptyShelves > 0) {
    return 'warning';
  }
  return 'success';
}

export function toneForActivePromos(activeCount: number): DashboardTone {
  return activeCount > 0 ? 'success' : 'neutral';
}
