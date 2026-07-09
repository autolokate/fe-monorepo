import type { CreatePromoBody } from '@autolokate/api-client';

import { toIsoDateTime, type CreatePromoFormValues } from '@/features/promos/create-promo-schema';

export function toCreatePromoBody(values: CreatePromoFormValues): CreatePromoBody {
  return {
    code: values.code,
    validFrom: toIsoDateTime(values.validFrom),
    validTo: toIsoDateTime(values.validTo),
    active: values.active,
    ...(values.discountPercent !== undefined ? { discountPercent: values.discountPercent } : {}),
    ...(values.discountPaise !== undefined ? { discountPaise: values.discountPaise } : {}),
    ...(values.maxRedemptions !== undefined ? { maxRedemptions: values.maxRedemptions } : {}),
    ...(values.maxPerAccount !== undefined ? { maxPerAccount: values.maxPerAccount } : {}),
  };
}
