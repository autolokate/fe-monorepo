import type { AdminPromoDto } from '@autolokate/api-client';

export type PromoMetrics = {
  totalPromos: number;
  activePromos: number;
  inactivePromos: number;
  upcomingPromos: number;
  expiredPromos: number;
};

export type PromoLifecycleStatus = 'ACTIVE' | 'INACTIVE' | 'UPCOMING' | 'EXPIRED';

export function getPromoLifecycleStatus(
  promo: AdminPromoDto,
  now = Date.now(),
): PromoLifecycleStatus {
  if (!promo.active) {
    return 'INACTIVE';
  }

  const validFrom = promo.validFrom ? Date.parse(promo.validFrom) : null;
  const validTo = promo.validTo ? Date.parse(promo.validTo) : null;

  if (validFrom !== null && !Number.isNaN(validFrom) && validFrom > now) {
    return 'UPCOMING';
  }

  if (validTo !== null && !Number.isNaN(validTo) && validTo < now) {
    return 'EXPIRED';
  }

  return 'ACTIVE';
}

export function formatPromoDiscount(promo: AdminPromoDto): string {
  if (promo.discountPaise !== null) {
    return `₹${(promo.discountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
  if (promo.discountPercent !== null) {
    return `${String(promo.discountPercent)}%`;
  }
  return '—';
}

export function computePromoMetrics(promos: AdminPromoDto[]): PromoMetrics {
  const now = Date.now();
  let activePromos = 0;
  let inactivePromos = 0;
  let upcomingPromos = 0;
  let expiredPromos = 0;

  for (const promo of promos) {
    const status = getPromoLifecycleStatus(promo, now);
    switch (status) {
      case 'ACTIVE':
        activePromos += 1;
        break;
      case 'INACTIVE':
        inactivePromos += 1;
        break;
      case 'UPCOMING':
        upcomingPromos += 1;
        break;
      case 'EXPIRED':
        expiredPromos += 1;
        break;
    }
  }

  return {
    totalPromos: promos.length,
    activePromos,
    inactivePromos,
    upcomingPromos,
    expiredPromos,
  };
}
