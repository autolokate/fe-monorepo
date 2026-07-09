import type { ApiClient } from './client';
import type { ApiPlanTier } from './plans';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/** Maps to OpenAPI `ValidatePromoBodyDto`. */
export type ValidatePromoBody = {
  code: string;
  planTier: ApiPlanTier;
  riderCount: number;
  promoCode: string;
};

/** Maps to OpenAPI `PromoPreviewDto` — envelope `data` on POST /v1/promos/validate. */
export type PromoPreviewDto = {
  promoCode: string;
  subtotalPaise: number;
  gstPaise: number;
  discountPaise: number;
  totalPaise: number;
};

/** POST /v1/promos/validate — preview promo pricing on the order summary (R08b). */
export async function validatePromo(
  client: ApiClient,
  body: ValidatePromoBody,
): Promise<PromoPreviewDto> {
  const response = await client.post<unknown>(endpoints.promos.validate, body);
  return unwrapEnvelope(response) as PromoPreviewDto;
}
