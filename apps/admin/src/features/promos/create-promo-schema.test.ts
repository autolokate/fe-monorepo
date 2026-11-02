import { describe, expect, it } from 'vitest';

import { createSkuShape } from '@/features/catalog/catalog-schemas';
import { createPromoSchema } from '@/features/promos/create-promo-schema';

const base = {
  code: 'DIWALI',
  discountRupees: '',
  validFrom: '2026-11-01T00:00',
  validTo: '2026-12-01T00:00',
  active: true,
};

describe('create promo schema', () => {
  it('requires a percent or a flat discount (the backend rejects neither)', () => {
    expect(createPromoSchema.safeParse(base).success).toBe(false);
    expect(createPromoSchema.safeParse({ ...base, discountPercent: 10 }).success).toBe(true);
    expect(createPromoSchema.safeParse({ ...base, discountRupees: '100' }).success).toBe(true);
  });
});

describe('create SKU code', () => {
  it('matches the backend skuCode pattern', () => {
    const code = createSkuShape.skuCode;
    expect(code.safeParse('SKU-B2C_SHIELD').success).toBe(true);
    expect(code.safeParse('A').success).toBe(false);
    expect(code.safeParse('-SKU').success).toBe(false);
    expect(code.safeParse('sku-lower').success).toBe(false);
  });
});
