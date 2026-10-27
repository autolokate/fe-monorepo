import type { ApiClient } from './client';
import { endpoints } from './endpoints';
import { unwrapEnvelope } from './envelope';

/** Nest `schema.service_category` — hub tiles prefer a subset via `listServiceCategories`. */
export type ServiceCategory =
  | 'ras'
  | 'hospitals'
  | 'garages'
  | 'emergency'
  | 'roadside'
  | 'maintenance'
  | 'partners';

/** Nest `schema.service_provider_status`. */
export type ServiceProviderStatus = 'ACTIVE' | 'INACTIVE';

/** OpenAPI `ServiceCategoriesDto`. */
export type ServiceCategoriesDto = {
  categories: ServiceCategory[];
};

/** OpenAPI `ServiceProviderDto` (consumer list/detail). */
export type ServiceProviderDto = {
  id: string;
  name: string;
  category: ServiceCategory;
  subtitle: string;
  distanceKm: number | null;
  rating: number | null;
  openNow: boolean | null;
  city: string;
  phone: string | null;
  services: string[];
  verifiedPartner: boolean;
  note: string | null;
  etaMinutes: number | null;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  reviewCount: number | null;
};

/** OpenAPI `AdminServiceProviderDto` — consumer fields + status. */
export type AdminServiceProviderDto = ServiceProviderDto & {
  status: ServiceProviderStatus;
};

/** Query for `GET /v1/services/providers`. */
export type ListServiceProvidersQuery = {
  category: ServiceCategory;
  filter?: 'all' | 'openNow' | 'verified';
  latitude?: number;
  longitude?: number;
  limit?: number;
};

/** Body for `PUT /admin/v1/services/providers`. */
export type UpsertServiceProviderBody = {
  id?: string;
  name: string;
  category: ServiceCategory;
  subtitle?: string;
  city: string;
  phone?: string | null;
  address?: string | null;
  note?: string | null;
  services?: string[];
  verifiedPartner?: boolean;
  openNow?: boolean | null;
  rating?: number | null;
  reviewCount?: number | null;
  etaMinutes?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: ServiceProviderStatus;
};

export type ServiceHubCategoryItem = {
  category: ServiceCategory;
  label?: string;
  sortOrder: number;
  visible: boolean;
};

export type ServiceHubCategoriesDto = {
  items: ServiceHubCategoryItem[];
};

function buildQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** GET /v1/services/categories — hub tile categories (CONSUMER). */
export async function listServiceCategories(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<ServiceCategoriesDto> {
  const response = await client.get<unknown>(endpoints.services.categories, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ServiceCategoriesDto;
}

/** GET /v1/services/providers — ACTIVE providers only for a category. */
export async function listServiceProviders(
  client: ApiClient,
  query: ListServiceProvidersQuery,
  options: { signal?: AbortSignal } = {},
): Promise<ServiceProviderDto[]> {
  const path = `${endpoints.services.providers}${buildQuery({
    category: query.category,
    filter: query.filter,
    latitude: query.latitude,
    longitude: query.longitude,
    limit: query.limit,
  })}`;
  const response = await client.get<unknown>(path, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ServiceProviderDto[];
}

/** GET /v1/services/providers/{id} — one ACTIVE provider. */
export async function getServiceProvider(
  client: ApiClient,
  id: string,
  options: { signal?: AbortSignal } = {},
): Promise<ServiceProviderDto> {
  const response = await client.get<unknown>(endpoints.services.provider(id), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ServiceProviderDto;
}

/** GET /admin/v1/services/providers — ACTIVE + INACTIVE (OPERATOR). */
export async function listAdminServiceProviders(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<AdminServiceProviderDto[]> {
  const response = await client.get<unknown>(endpoints.admin.listServiceProviders, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminServiceProviderDto[];
}

/** GET /admin/v1/services/hub-categories */
export async function listAdminServiceHubCategories(
  client: ApiClient,
  options: { signal?: AbortSignal } = {},
): Promise<ServiceHubCategoriesDto> {
  const response = await client.get<unknown>(endpoints.admin.serviceHubCategories, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ServiceHubCategoriesDto;
}

/** PUT /admin/v1/services/hub-categories */
export async function replaceAdminServiceHubCategories(
  client: ApiClient,
  body: ServiceHubCategoriesDto,
  options: { signal?: AbortSignal } = {},
): Promise<ServiceHubCategoriesDto> {
  const response = await client.put<unknown>(endpoints.admin.serviceHubCategories, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as ServiceHubCategoriesDto;
}

/** PUT /admin/v1/services/providers — create or update (OPERATOR). */
export async function upsertServiceProvider(
  client: ApiClient,
  body: UpsertServiceProviderBody,
  options: { signal?: AbortSignal } = {},
): Promise<AdminServiceProviderDto> {
  const response = await client.put<unknown>(endpoints.admin.upsertServiceProvider, body, {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminServiceProviderDto;
}

/** DELETE /admin/v1/services/providers/{id} — soft-deactivate (OPERATOR). */
export async function deactivateServiceProvider(
  client: ApiClient,
  id: string,
  options: { signal?: AbortSignal } = {},
): Promise<AdminServiceProviderDto> {
  const response = await client.delete<unknown>(endpoints.admin.deactivateServiceProvider(id), {
    ...(options.signal ? { signal: options.signal } : {}),
  });
  return unwrapEnvelope(response) as AdminServiceProviderDto;
}
