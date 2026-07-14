import type { CreatePromoBody } from '@autolokate/api-client';

import { rupeesToPaise } from '@/services/catalog/catalog-money';
import { toIsoDateTime, type CreatePromoFormValues } from '@/features/promos/create-promo-schema';

export function toCreatePromoBody(values: CreatePromoFormValues): CreatePromoBody {
  const discountPaise =
    values.discountRupees.trim() === '' ? undefined : (rupeesToPaise(values.discountRupees) ?? undefined);

  return {
    code: values.code,
    validFrom: toIsoDateTime(values.validFrom),
    validTo: toIsoDateTime(values.validTo),
    active: values.active,
    ...(values.discountPercent !== undefined ? { discountPercent: values.discountPercent } : {}),
    ...(discountPaise !== undefined ? { discountPaise } : {}),
    ...(values.maxRedemptions !== undefined ? { maxRedemptions: values.maxRedemptions } : {}),
    ...(values.maxPerAccount !== undefined ? { maxPerAccount: values.maxPerAccount } : {}),
  };
}
