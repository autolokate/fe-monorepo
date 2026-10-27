import {
  deactivateServiceProvider,
  listAdminServiceHubCategories,
  listAdminServiceProviders,
  replaceAdminServiceHubCategories,
  upsertServiceProvider,
  type AdminServiceProviderDto,
  type ServiceCategory,
  type ServiceHubCategoriesDto,
  type UpsertServiceProviderBody,
} from '@autolokate/api-client';

import { getAdminApiClient } from '@/platform/api/admin-api-client';

/** GET /admin/v1/services/hub-categories (falls back pre-0092). */
export async function fetchServiceHubCategories(
  signal?: AbortSignal,
): Promise<ServiceHubCategoriesDto> {
  return listAdminServiceHubCategories(getAdminApiClient(), { signal });
}

/** PUT /admin/v1/services/hub-categories (requires migrate 0092). */
export async function saveServiceHubCategories(
  body: ServiceHubCategoriesDto,
  signal?: AbortSignal,
): Promise<ServiceHubCategoriesDto> {
  return replaceAdminServiceHubCategories(getAdminApiClient(), body, { signal });
}

/** GET /admin/v1/services/providers — ACTIVE + INACTIVE. */
export async function fetchAdminServiceProviders(
  signal?: AbortSignal,
): Promise<AdminServiceProviderDto[]> {
  return listAdminServiceProviders(getAdminApiClient(), { signal });
}

/** Filter Admin directory by category for the table. */
export function filterProvidersByCategory(
  rows: AdminServiceProviderDto[],
  category: ServiceCategory,
): AdminServiceProviderDto[] {
  return rows.filter((row) => row.category === category);
}

/** PUT /admin/v1/services/providers */
export async function saveServiceProvider(
  body: UpsertServiceProviderBody,
  signal?: AbortSignal,
): Promise<AdminServiceProviderDto> {
  return upsertServiceProvider(getAdminApiClient(), body, { signal });
}

/** DELETE /admin/v1/services/providers/{id} */
export async function deactivateProvider(
  id: string,
  signal?: AbortSignal,
): Promise<AdminServiceProviderDto> {
  return deactivateServiceProvider(getAdminApiClient(), id, { signal });
}
