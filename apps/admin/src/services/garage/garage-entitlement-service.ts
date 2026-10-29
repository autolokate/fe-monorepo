import {
  adjustGarageFreeBids,
  grantGaragePass,
  provisionGarage,
  publishGarageStore,
  setGarageGstVerification,
  type AdjustGarageFreeBidsBody,
  type GarageFreeBidsBalanceDto,
  type GaragePassGrantResultDto,
  type GarageStoreDto,
  type GrantGaragePassBody,
  type ProvisionGarageBody,
  type ProvisionGarageResultDto,
  type PublishGarageStoreResultDto,
  type SetGarageGstVerificationBody,
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

/** POST /admin/v1/garage/provision — OPERATOR + admin-plane step_up. */
export async function submitGarageProvision(
  body: ProvisionGarageBody,
  signal?: AbortSignal,
): Promise<ProvisionGarageResultDto> {
  return provisionGarage(getAdminApiClient(), body, { signal });
}

/** POST /admin/v1/garage/orgs/{orgId}/publish-store — Nearby / bidding storefront. */
export async function submitGaragePublishStore(
  orgId: string,
  signal?: AbortSignal,
): Promise<PublishGarageStoreResultDto> {
  return publishGarageStore(getAdminApiClient(), orgId, { signal });
}

/** POST /admin/v1/garage/orgs/{orgId}/gst-verification — set store GST status. */
export async function submitGarageGstVerification(
  orgId: string,
  body: SetGarageGstVerificationBody,
  signal?: AbortSignal,
): Promise<GarageStoreDto> {
  return setGarageGstVerification(getAdminApiClient(), orgId, body, { signal });
}
