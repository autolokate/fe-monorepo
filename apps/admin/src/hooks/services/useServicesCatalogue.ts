import type {
  AdminServiceProviderDto,
  ServiceCategory,
  UpsertServiceProviderBody,
} from '@autolokate/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import {
  deactivateProvider,
  fetchAdminServiceProviders,
  fetchServiceHubCategories,
  filterProvidersByCategory,
  saveServiceProvider,
} from '@/services/services-catalogue/admin-services-catalogue-service';

/** Fallback hub tiles when hub-categories GET fails. */
export const DEFAULT_SERVICE_HUB_CATEGORIES: ServiceCategory[] = [
  'ras',
  'hospitals',
  'garages',
  'emergency',
  'maintenance',
];

export const servicesCatalogueQueryKeys = {
  all: ['admin', 'services-catalogue'] as const,
  hub: () => [...servicesCatalogueQueryKeys.all, 'hub'] as const,
  providers: () => [...servicesCatalogueQueryKeys.all, 'providers'] as const,
};

export function useServicesCatalogue(initialCategory: ServiceCategory = 'ras') {
  const [category, setCategory] = useState<ServiceCategory>(initialCategory);
  const queryClient = useQueryClient();

  const hubQuery = useQuery({
    queryKey: servicesCatalogueQueryKeys.hub(),
    queryFn: ({ signal }) => fetchServiceHubCategories(signal),
    meta: { errorMessage: 'Unable to load service hub categories.' },
    retry: false,
  });

  const providersQuery = useQuery({
    queryKey: servicesCatalogueQueryKeys.providers(),
    queryFn: ({ signal }) => fetchAdminServiceProviders(signal),
    meta: { errorMessage: 'Unable to load service providers.' },
    retry: false,
  });

  const upsertMutation = useMutation({
    mutationFn: (body: UpsertServiceProviderBody) => saveServiceProvider(body),
    onSuccess: async (saved) => {
      setCategory(saved.category);
      await queryClient.invalidateQueries({ queryKey: servicesCatalogueQueryKeys.all });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'services-upsert', toast: true });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateProvider(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: servicesCatalogueQueryKeys.all });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'services-deactivate', toast: true });
    },
  });

  const categories: ServiceCategory[] = useMemo(() => {
    const items = hubQuery.data?.items ?? [];
    const visible = items.filter((item) => item.visible).map((item) => item.category);
    if (visible.length > 0) return visible;
    const all = items.map((item) => item.category);
    if (all.length > 0) return all;
    return DEFAULT_SERVICE_HUB_CATEGORIES;
  }, [hubQuery.data]);

  const allProviders: AdminServiceProviderDto[] = providersQuery.data ?? [];
  const providers = filterProvidersByCategory(allProviders, category);

  const providersErrorMessage = providersQuery.isError
    ? mapAdminApiError(providersQuery.error).userMessage
    : null;
  const categoriesErrorMessage = hubQuery.isError
    ? mapAdminApiError(hubQuery.error).userMessage
    : null;

  return {
    category,
    setCategory,
    categories,
    hubItems: hubQuery.data?.items ?? [],
    providers,
    isLoading: providersQuery.isLoading || hubQuery.isLoading,
    isFetching: providersQuery.isFetching || hubQuery.isFetching,
    providersErrorMessage,
    categoriesErrorMessage,
    userErrorMessage: providersErrorMessage,
    upsertMutation,
    deactivateMutation,
    refresh: () => {
      void hubQuery.refetch();
      void providersQuery.refetch();
    },
    data: providersQuery.data,
  };
}
