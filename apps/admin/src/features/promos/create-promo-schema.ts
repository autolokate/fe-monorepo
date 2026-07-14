import { z } from 'zod';

import { optionalRupeeAmount } from '@/features/catalog/catalog-schemas';

function optionalIntField(min: number, max?: number) {
  return z
    .number()
    .int()
    .min(min, `Minimum value is ${String(min)}.`)
    .max(max ?? Number.MAX_SAFE_INTEGER)
    .optional();
}

export const createPromoSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, 'Promo code is required.')
      .max(64, 'Promo code is too long.'),
    discountPercent: optionalIntField(1, 100),
    discountRupees: optionalRupeeAmount,
    validFrom: z.string().min(1, 'Start date is required.'),
    validTo: z.string().min(1, 'End date is required.'),
    maxRedemptions: optionalIntField(1),
    maxPerAccount: optionalIntField(1),
    active: z.boolean(),
  })
  .refine(
    (values) => {
      const from = Date.parse(values.validFrom);
      const to = Date.parse(values.validTo);
      return !Number.isNaN(from) && !Number.isNaN(to) && to > from;
    },
    { message: 'End date must be after start date.', path: ['validTo'] },
  );

export type CreatePromoFormValues = z.infer<typeof createPromoSchema>;

export function toIsoDateTime(localValue: string): string {
  return new Date(localValue).toISOString();
}

export function defaultPromoValidity(): { validFrom: string; validTo: string } {
  const now = new Date();
  const end = new Date(now);
  end.setMonth(end.getMonth() + 6);
  return {
    validFrom: toLocalDateTimeInput(now),
    validTo: toLocalDateTimeInput(end),
  };
}

export function toLocalDateTimeInput(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${String(date.getFullYear())}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
