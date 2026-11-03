import {
  getAdminRasRequest,
  listAdminRasRequests,
  type AdminRasRequestDto,
  type AdminRasStatus,
  type AdminV4Page,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

export const RAS_PAGE_LIMIT = 50;

/** GET /admin/v1/services/ras/requests */
export async function fetchRasRequestsPage(
  query: { status?: AdminRasStatus; cursor?: string; limit?: number },
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminRasRequestDto>> {
  return listAdminRasRequests(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/services/ras/requests/{id} */
export async function fetchRasRequest(
  id: string,
  signal?: AbortSignal,
): Promise<AdminRasRequestDto> {
  return getAdminRasRequest(getAdminApiClient(), id, { signal });
}
