import {
  createPlanVersion,
  createSku,
  getPlanFeatures,
  listAdminPlans,
  listSkus,
  updatePlan,
  updatePlanFeatures,
  updateSku,
  type AdminPlanDto,
  type CreatePlanBody,
  type CreateSkuBody,
  type ListAdminPlansQuery,
  type ListSkusQuery,
  type PlanFeaturesDto,
  type SkuSummaryDto,
  type UpdatePlanBody,
  type UpdatePlanFeaturesBody,
  type UpdateSkuBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** Every plan VERSION, including superseded and retired ones — the console shows the history. */
export async function fetchAdminPlans(
  query: ListAdminPlansQuery = {},
  signal?: AbortSignal,
): Promise<AdminPlanDto[]> {
  return listAdminPlans(getAdminApiClient(), query, { signal });
}

/** Mints a NEW `(tier, version)`. Plans are immutable — this is the only way to change a price or name. */
export async function createCatalogPlanVersion(
  body: CreatePlanBody,
  signal?: AbortSignal,
): Promise<AdminPlanDto> {
  return createPlanVersion(getAdminApiClient(), body, { signal });
}

/** Lifecycle only (publish / retire). The server rejects a body naming price, tier or name. */
export async function updateCatalogPlanLifecycle(
  planId: string,
  body: UpdatePlanBody,
  signal?: AbortSignal,
): Promise<AdminPlanDto> {
  return updatePlan(getAdminApiClient(), planId, body, { signal });
}

export async function fetchPlanFeatures(
  planId: string,
  signal?: AbortSignal,
): Promise<PlanFeaturesDto> {
  return getPlanFeatures(getAdminApiClient(), planId, { signal });
}

/** Features belong to a plan VERSION and are editable in place — unlike the plan's price. */
export async function saveCatalogPlanFeatures(
  planId: string,
  body: UpdatePlanFeaturesBody,
  signal?: AbortSignal,
): Promise<PlanFeaturesDto> {
  return updatePlanFeatures(getAdminApiClient(), planId, body, { signal });
}

export async function fetchCatalogSkus(
  query: ListSkusQuery = {},
  signal?: AbortSignal,
): Promise<SkuSummaryDto[]> {
  return listSkus(getAdminApiClient(), query, { signal });
}

export async function createCatalogSku(
  body: CreateSkuBody,
  signal?: AbortSignal,
): Promise<SkuSummaryDto> {
  return createSku(getAdminApiClient(), body, { signal });
}

export async function updateCatalogSku(
  skuId: string,
  body: UpdateSkuBody,
  signal?: AbortSignal,
): Promise<SkuSummaryDto> {
  return updateSku(getAdminApiClient(), skuId, body, { signal });
}
