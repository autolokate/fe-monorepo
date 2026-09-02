import type { AdminPromoDto } from '@autolokate/api-client';

import {
  getPromoLifecycleStatus,
  type PromoLifecycleStatus,
} from '@/services/promos/promo-metrics';

export type PromoStatusFilter = PromoLifecycleStatus | 'ALL';

export type PromoStatusFilterOption = {
  value: PromoStatusFilter;
  label: string;
};

/** Client-side filters — OpenAPI exposes no query parameters on GET /admin/v1/promos. */
export const PROMO_STATUS_FILTERS: PromoStatusFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'UPCOMING', label: 'Upcoming' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export function filterPromosByStatus(
  promos: AdminPromoDto[],
  filter: PromoStatusFilter,
): AdminPromoDto[] {
  if (filter === 'ALL') {
    return promos;
  }
  return promos.filter((promo) => getPromoLifecycleStatus(promo) === filter);
}
