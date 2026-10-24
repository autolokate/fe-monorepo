import {
  getGarageCommercialConfig,
  listGarageCommercialConfigHistory,
  updateGarageCommercialConfig,
  type GarageCommercialConfigAuditDto,
  type GarageCommercialConfigDto,
  type UpdateGarageCommercialConfigBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export async function fetchGarageCommercialConfig(
  signal?: AbortSignal,
): Promise<GarageCommercialConfigDto> {
  return getGarageCommercialConfig(getAdminApiClient(), { signal });
}

export async function saveGarageCommercialConfig(
  body: UpdateGarageCommercialConfigBody,
  signal?: AbortSignal,
): Promise<GarageCommercialConfigDto> {
  return updateGarageCommercialConfig(getAdminApiClient(), body, { signal });
}

export async function fetchGarageCommercialConfigHistory(
  signal?: AbortSignal,
  limit = 50,
): Promise<GarageCommercialConfigAuditDto[]> {
  return listGarageCommercialConfigHistory(getAdminApiClient(), { signal, limit });
}
