import { createAdminPromo, listAdminPromos, type AdminPromoDto, type CreatePromoBody } from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchAdminPromos(signal?: AbortSignal): Promise<AdminPromoDto[]> {
  return listAdminPromos(getAdminApiClient(), { signal });
}

export async function createPromo(
  body: CreatePromoBody,
  signal?: AbortSignal,
): Promise<AdminPromoDto> {
  return createAdminPromo(getAdminApiClient(), body, { signal });
}
