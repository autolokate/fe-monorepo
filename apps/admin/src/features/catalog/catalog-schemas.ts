import type { ApiPlanTier, QrBatchChannel } from '@autolokate/api-client';
import { z } from 'zod';

import { rupeesToPaise } from '@/services/catalog/catalog-money';
import { PLAN_TIERS } from '@/services/catalog/catalog-model';

const planTierEnum = z.enum(PLAN_TIERS satisfies readonly [ApiPlanTier, ...ApiPlanTier[]]);
const channelEnum = z.enum(['B2C', 'B2B2C', 'B2B'] satisfies [QrBatchChannel, ...QrBatchChannel[]]);

/** Rupee-denominated money field — validated by the paise parser so the form and the wire agree. */
const rupeeAmount = z
  .string()
  .trim()
  .min(1, 'Price is required.')
  .refine((value) => rupeesToPaise(value) !== null, {
    message: 'Enter an amount in rupees — e.g. 999 or 999.50 (up to 2 decimals).',
  });

/**
 * `POST /admin/v1/plans` — mints a new `(tier, version)`.
 *
 * There is deliberately no update counterpart: a Subscription pins `(plan_id, plan_version)`, so a price is
 * never edited in place. This form IS the price-change path.
 */
export const createPlanVersionSchema = z.object({
  tier: planTierEnum,
  name: z.string().trim().min(1, 'Name is required.').max(80, 'Name is too long.'),
  priceRupees: rupeeAmount,
  riderEligible: z.boolean(),
  effectiveFrom: z.string(),
  retireCurrent: z.boolean(),
});

export type CreatePlanVersionFormValues = z.infer<typeof createPlanVersionSchema>;

/**
 * `PATCH /admin/v1/plans/{planId}/features`.
 *
 * `features` must survive as a non-empty list: an empty one renders a blank plan card in the app — a bug
 * that has already shipped once.
 */
export const planFeaturesSchema = z.object({
  features: z
    .array(
      z.object({
        value: z
          .string()
          .trim()
          .min(1, 'A feature bullet cannot be blank.')
          .max(120, 'Keep a bullet under 120 characters.'),
      }),
    )
    .min(1, 'Add at least one feature — an empty list renders a blank plan card.'),
  badge: z.string().trim().max(32, 'Badge is too long.'),
  includesLabel: z.string().trim().max(64, 'Includes label is too long.'),
});

export type PlanFeaturesFormValues = z.infer<typeof planFeaturesSchema>;

const shelfField = z
  .array(planTierEnum)
  .min(1, 'The shelf cannot be empty — a SKU with no offered tiers sells nothing.');

const defaultPlanField = z.string().min(1, 'Pick a default plan.');

const listPriceField = rupeeAmount;

const riderDefaultField = z
  .number({ message: 'Rider default is required.' })
  .int('Rider default must be a whole number.')
  .min(0, 'Rider default cannot be negative.')
  .max(10, 'Rider default looks too high.');

export const updateSkuShape = {
  offeredTiers: shelfField,
  defaultPlanId: defaultPlanField,
  listPriceRupees: listPriceField,
  riderDefault: riderDefaultField,
  active: z.boolean(),
};

export const createSkuShape = {
  skuCode: z
    .string()
    .trim()
    .min(1, 'SKU code is required.')
    .max(64, 'SKU code is too long.')
    .regex(/^[A-Z0-9-]+$/, 'Use uppercase letters, digits and hyphens — e.g. SKU-B2C-SHIELD.'),
  channel: channelEnum,
  prepaid: z.boolean(),
  sponsorOrgId: z.string().trim(),
  ...updateSkuShape,
};

/**
 * The Sku's `defaultPlanId` must name a plan whose tier is on the Sku's OWN shelf — otherwise the SKU's
 * default is unsellable against its own stock. The server enforces this; we mirror it so the admin sees it
 * before a round trip. `tierByPlanId` is threaded in because zod cannot look plans up on its own.
 */
function checkDefaultPlanOnShelf(
  values: { defaultPlanId: string; offeredTiers: ApiPlanTier[] },
  ctx: z.RefinementCtx,
  tierByPlanId: ReadonlyMap<string, ApiPlanTier>,
): void {
  const tier = tierByPlanId.get(values.defaultPlanId);
  if (tier === undefined) {
    return;
  }
  if (!values.offeredTiers.includes(tier)) {
    ctx.addIssue({
      code: 'custom',
      path: ['defaultPlanId'],
      message: `${tier} is not on this SKU's shelf. Add it to the offered tiers, or pick a default that is.`,
    });
  }
}

export function makeCreateSkuSchema(tierByPlanId: ReadonlyMap<string, ApiPlanTier>) {
  return z.object(createSkuShape).superRefine((values, ctx) => {
    checkDefaultPlanOnShelf(values, ctx, tierByPlanId);
  });
}

export function makeUpdateSkuSchema(tierByPlanId: ReadonlyMap<string, ApiPlanTier>) {
  return z.object(updateSkuShape).superRefine((values, ctx) => {
    checkDefaultPlanOnShelf(values, ctx, tierByPlanId);
  });
}

export type CreateSkuFormValues = z.infer<z.ZodObject<typeof createSkuShape>>;
export type UpdateSkuFormValues = z.infer<z.ZodObject<typeof updateSkuShape>>;
