import {
  getAdminPartner,
  getAdminPartnerGarageRequest,
  getAdminTaxiRequest,
  listAdminPartnerGarageRequestsPage,
  listAdminPartnersPage,
  listAdminTaxiRequestsPage,
  type AdminGarageRequestInboxDto,
  type AdminPartnerOrgDetailDto,
  type AdminPartnerOrgDto,
  type AdminPartnersPageResult,
  type AdminTaxiRequestInboxDto,
  type ListAdminGarageRequestsQuery,
  type ListAdminPartnersQuery,
  type ListAdminTaxiRequestsQuery,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/partners */
export async function fetchAdminPartnersPage(
  query: ListAdminPartnersQuery = {},
  signal?: AbortSignal,
): Promise<AdminPartnersPageResult<AdminPartnerOrgDto>> {
  return listAdminPartnersPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/partners/{orgId} */
export async function fetchAdminPartner(
  orgId: string,
  signal?: AbortSignal,
): Promise<AdminPartnerOrgDetailDto> {
  return getAdminPartner(getAdminApiClient(), orgId, { signal });
}

/** GET /admin/v1/partners/requests */
export async function fetchAdminGarageRequestsPage(
  query: ListAdminGarageRequestsQuery = {},
  signal?: AbortSignal,
): Promise<AdminPartnersPageResult<AdminGarageRequestInboxDto>> {
  return listAdminPartnerGarageRequestsPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/partners/requests/{id} */
export async function fetchAdminGarageRequest(
  id: string,
  signal?: AbortSignal,
): Promise<AdminGarageRequestInboxDto> {
  return getAdminPartnerGarageRequest(getAdminApiClient(), id, { signal });
}

/** GET /admin/v1/taxi/requests */
export async function fetchAdminTaxiRequestsPage(
  query: ListAdminTaxiRequestsQuery = {},
  signal?: AbortSignal,
): Promise<AdminPartnersPageResult<AdminTaxiRequestInboxDto>> {
  return listAdminTaxiRequestsPage(getAdminApiClient(), query, { signal });
}

/** GET /admin/v1/taxi/requests/{id} */
export async function fetchAdminTaxiRequest(
  id: string,
  signal?: AbortSignal,
): Promise<AdminTaxiRequestInboxDto> {
  return getAdminTaxiRequest(getAdminApiClient(), id, { signal });
}
