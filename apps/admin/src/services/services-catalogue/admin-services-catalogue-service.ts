import {
  ApiError,
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

function isMissingEndpoint(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 404 || error.code === 'not_found');
}

/** GET /admin/v1/services/hub-categories (falls back pre-0092 / undeployed). */
export async function fetchServiceHubCategories(
  signal?: AbortSignal,
): Promise<ServiceHubCategoriesDto> {
  try {
    return await listAdminServiceHubCategories(getAdminApiClient(), { signal });
  } catch (error) {
    // Dev tip may lack hub-categories until migrate 0092 + BE deploy — empty → UI defaults.
    if (isMissingEndpoint(error)) {
      return { items: [] };
    }
    throw error;
  }
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
  try {
    return await listAdminServiceProviders(getAdminApiClient(), { signal });
  } catch (error) {
    // Deployed Dev currently exposes PUT upsert only; treat missing GET as empty list so
    // Operators can still author via PUT without a hard error boundary.
    if (isMissingEndpoint(error)) {
      return [];
    }
    throw error;
  }
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
