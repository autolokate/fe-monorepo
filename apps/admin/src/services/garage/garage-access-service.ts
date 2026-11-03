import {
  getAdminGarageAccess,
  listAdminGaragePasses,
  listAdminGarageRevenue,
  type AdminGarageAccessDto,
  type AdminGaragePassPurchaseDto,
  type AdminGarageRevenueDto,
  type AdminV4Page,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

function opts(signal?: AbortSignal) {
  return signal ? { signal } : {};
}

/** GET /admin/v1/garage/orgs/{orgId}/access — weekly free bids + active pass. */
export function fetchGarageAccess(
  orgId: string,
  signal?: AbortSignal,
): Promise<AdminGarageAccessDto> {
  return getAdminGarageAccess(getAdminApiClient(), orgId, opts(signal));
}

/** GET /admin/v1/garage/orgs/{orgId}/passes — purchases + admin grants (keyset). */
export function fetchGaragePassesPage(
  orgId: string,
  query: { limit?: number; cursor?: string },
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminGaragePassPurchaseDto>> {
  return listAdminGaragePasses(getAdminApiClient(), orgId, query, opts(signal));
}

/** GET /admin/v1/garage/revenue — paid pass checkouts (keyset). */
export function fetchGarageRevenuePage(
  query: { from?: string; to?: string; orgId?: string; limit?: number; cursor?: string },
  signal?: AbortSignal,
): Promise<AdminV4Page<AdminGarageRevenueDto>> {
  return listAdminGarageRevenue(getAdminApiClient(), query, opts(signal));
}
