import {
  adjustGarageFreeBids,
  grantGaragePass,
  type AdjustGarageFreeBidsBody,
  type GarageFreeBidsBalanceDto,
  type GaragePassGrantResultDto,
  type GrantGaragePassBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** POST /admin/v1/garage/orgs/{orgId}/passes/grant — server-confirmed ops grant only. */
export async function submitGaragePassGrant(
  orgId: string,
  body: GrantGaragePassBody,
  signal?: AbortSignal,
): Promise<GaragePassGrantResultDto> {
  return grantGaragePass(getAdminApiClient(), orgId, body, { signal });
}

/** POST /admin/v1/garage/orgs/{orgId}/free-bids/adjust — server-confirmed balance only. */
export async function submitGarageFreeBidsAdjust(
  orgId: string,
  body: AdjustGarageFreeBidsBody,
  signal?: AbortSignal,
): Promise<GarageFreeBidsBalanceDto> {
  return adjustGarageFreeBids(getAdminApiClient(), orgId, body, { signal });
}
