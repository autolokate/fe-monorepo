import type { PlanTierFilter } from '@/hooks/catalog/useCatalogPlans';
import type { SkuChannelFilter } from '@/hooks/catalog/useCatalogSkus';

export type PlanTierFilterOption = {
  value: PlanTierFilter;
  label: string;
};

/** `GET /admin/v1/plans` takes `tier` — this filter is server-side. */
export const PLAN_TIER_FILTERS: PlanTierFilterOption[] = [
  { value: 'ALL', label: 'All tiers' },
  { value: 'SAFE', label: 'SAFE' },
  { value: 'SECURE', label: 'SECURE' },
  { value: 'SHIELD', label: 'SHIELD' },
  { value: 'SHIELD_PLUS', label: 'SHIELD PLUS' },
];

export type SkuChannelFilterOption = {
  value: SkuChannelFilter;
  label: string;
};

/** `GET /admin/v1/skus` takes `channel` — this filter is server-side. */
export const SKU_CHANNEL_FILTERS: SkuChannelFilterOption[] = [
  { value: 'ALL', label: 'All channels' },
  { value: 'B2C', label: 'B2C' },
  { value: 'B2B2C', label: 'B2B2C' },
  { value: 'B2B', label: 'B2B' },
];

export type SkuActivityFilter = 'ALL' | 'ACTIVE_ONLY';

export type SkuActivityFilterOption = {
  value: SkuActivityFilter;
  label: string;
};

/**
 * `active` gates NEW batches only — it does NOT stop existing stock selling, so "Accepting new batches" is
 * the honest label for the narrow filter, and "All" is the default.
 */
export const SKU_ACTIVITY_FILTERS: SkuActivityFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE_ONLY', label: 'Accepting new batches' },
];
