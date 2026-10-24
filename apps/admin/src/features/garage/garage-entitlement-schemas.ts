import { z } from 'zod';

export const grantGaragePassSchema = z.object({
  orgId: z.string().trim().min(1, 'Organization id is required.'),
  kind: z.enum(['DAY', 'MONTH']),
  idempotencyKey: z.string().trim().optional(),
});

export type GrantGaragePassFormValues = z.infer<typeof grantGaragePassSchema>;

export const adjustGarageFreeBidsSchema = z.object({
  orgId: z.string().trim().min(1, 'Organization id is required.'),
  delta: z
    .string()
    .trim()
    .min(1, 'Delta is required.')
    .refine((value) => /^-?\d+$/.test(value), { message: 'Delta must be a whole number.' })
    .refine((value) => Number(value) !== 0, { message: 'Delta must be non-zero.' }),
  note: z.string().trim().optional(),
  raiseLifetime: z.boolean().optional(),
  idempotencyKey: z.string().trim().optional(),
});

export type AdjustGarageFreeBidsFormValues = z.infer<typeof adjustGarageFreeBidsSchema>;

export function toGrantPassBody(values: GrantGaragePassFormValues) {
  const key = values.idempotencyKey?.trim();
  return {
    kind: values.kind,
    ...(key ? { idempotencyKey: key } : {}),
  };
}

export function toAdjustFreeBidsBody(values: AdjustGarageFreeBidsFormValues) {
  const key = values.idempotencyKey?.trim();
  const note = values.note?.trim();
  return {
    delta: Number(values.delta),
    ...(note ? { note } : {}),
    ...(values.raiseLifetime ? { raiseLifetime: true } : {}),
    ...(key ? { idempotencyKey: key } : {}),
  };
}

export const provisionGarageSchema = z.object({
  accountId: z.string().trim().uuid('Account id must be a UUID.'),
  orgName: z.string().trim().min(1, 'Organization name is required.'),
  ownerName: z.string().trim().min(1, 'Owner name is required.'),
  storeName: z.string().trim().optional(),
  storePhone: z.string().trim().optional(),
});

export type ProvisionGarageFormValues = z.infer<typeof provisionGarageSchema>;

export function toProvisionGarageBody(values: ProvisionGarageFormValues) {
  const storeName = values.storeName?.trim();
  const storePhone = values.storePhone?.trim();
  return {
    accountId: values.accountId.trim(),
    orgName: values.orgName.trim(),
    ownerName: values.ownerName.trim(),
    ...(storeName ? { storeName } : {}),
    ...(storePhone ? { storePhone } : {}),
  };
}
