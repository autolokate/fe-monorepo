import {
  createGarageBusinessCategory,
  createGarageSubcategory,
  createGarageVehicleCategory,
  getAdminGarageTaxonomy,
  updateGarageBusinessCategory,
  updateGarageSubcategory,
  updateGarageVehicleCategory,
  type GarageTaxonomyTreeDto,
  type UpsertGarageTaxonomyItemBody,
  type UpsertGarageTaxonomySubcategoryBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchGarageTaxonomy(signal?: AbortSignal): Promise<GarageTaxonomyTreeDto> {
  return getAdminGarageTaxonomy(getAdminApiClient(), { signal });
}

export async function saveGarageVehicleCategory(
  input: { id?: string; body: UpsertGarageTaxonomyItemBody },
  signal?: AbortSignal,
) {
  const client = getAdminApiClient();
  if (input.id) {
    return updateGarageVehicleCategory(client, input.id, input.body, { signal });
  }
  return createGarageVehicleCategory(client, input.body, { signal });
}

export async function saveGarageBusinessCategory(
  input: { id?: string; body: UpsertGarageTaxonomyItemBody },
  signal?: AbortSignal,
) {
  const client = getAdminApiClient();
  if (input.id) {
    return updateGarageBusinessCategory(client, input.id, input.body, { signal });
  }
  return createGarageBusinessCategory(client, input.body, { signal });
}

export async function saveGarageSubcategory(
  input: { id?: string; body: UpsertGarageTaxonomySubcategoryBody },
  signal?: AbortSignal,
) {
  const client = getAdminApiClient();
  if (input.id) {
    return updateGarageSubcategory(client, input.id, input.body, { signal });
  }
  return createGarageSubcategory(client, input.body, { signal });
}
