import type { ApiPlanTier, QrBatchChannel } from '@autolokate/api-client';

export type CatalogSkuListParams = {
  channel: QrBatchChannel | 'ALL';
  includeInactive: boolean;
};

export const catalogQueryKeys = {
  all: ['admin', 'catalog'] as const,
  plans: () => [...catalogQueryKeys.all, 'plans'] as const,
  plansList: (tier: ApiPlanTier | 'ALL') => [...catalogQueryKeys.plans(), 'list', tier] as const,
  planFeatures: (planId: string) => [...catalogQueryKeys.plans(), 'features', planId] as const,
  skus: () => [...catalogQueryKeys.all, 'skus'] as const,
  skusList: (params: CatalogSkuListParams) => [...catalogQueryKeys.skus(), 'list', params] as const,
};

/** The create-batch SKU picker keys its own cache — a catalog write must refresh it too. */
export const legacySkuQueryKeyPrefix = ['admin', 'skus'] as const;
