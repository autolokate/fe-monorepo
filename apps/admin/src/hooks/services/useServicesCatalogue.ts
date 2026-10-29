import {
  ApiError,
  type AdminServiceProviderDto,
  type ServiceCategory,
  type ServiceHubCategoryItem,
  type UpsertServiceProviderBody,
} from '@autolokate/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import {
  deactivateProvider,
  fetchAdminServiceProviders,
  fetchServiceHubCategories,
  filterProvidersByCategory,
  saveServiceHubCategories,
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

export const HUB_CATEGORIES_PERSISTENCE_UNAVAILABLE =
  'Hub categories persistence unavailable (needs migrate 0092)';

export const servicesCatalogueQueryKeys = {
  all: ['admin', 'services-catalogue'] as const,
  hub: () => [...servicesCatalogueQueryKeys.all, 'hub'] as const,
  providers: () => [...servicesCatalogueQueryKeys.all, 'providers'] as const,
};

function defaultHubItems(): ServiceHubCategoryItem[] {
  return DEFAULT_SERVICE_HUB_CATEGORIES.map((category, index) => ({
    category,
    label: category,
    sortOrder: (index + 1) * 10,
    visible: true,
  }));
}

function normalizeHubItems(items: ServiceHubCategoryItem[]): ServiceHubCategoryItem[] {
  return items
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.category.localeCompare(b.category))
    .map((item, index) => ({
      ...item,
      sortOrder: (index + 1) * 10,
    }));
}

function isHubPersistenceUnavailable(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return error.status === 404 || error.status === 500 || error.code === 'not_found';
}

export function useServicesCatalogue(initialCategory: ServiceCategory = 'ras') {
  const [category, setCategory] = useState<ServiceCategory>(initialCategory);
  const [hubDraft, setHubDraft] = useState<ServiceHubCategoryItem[]>([]);
  const [hubSaveError, setHubSaveError] = useState<string | null>(null);
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

  useEffect(() => {
    const items = hubQuery.data?.items ?? [];
    setHubDraft(normalizeHubItems(items.length > 0 ? items : defaultHubItems()));
    setHubSaveError(null);
  }, [hubQuery.data]);

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

  const saveHubMutation = useMutation({
    mutationFn: (items: ServiceHubCategoryItem[]) =>
      saveServiceHubCategories({ items: normalizeHubItems(items) }),
    retry: 0,
    onSuccess: async (result) => {
      setHubSaveError(null);
      showSuccessToast('Hub categories saved.');
      queryClient.setQueryData(servicesCatalogueQueryKeys.hub(), result);
      await queryClient.invalidateQueries({ queryKey: servicesCatalogueQueryKeys.hub() });
    },
    onError: (error) => {
      if (isHubPersistenceUnavailable(error)) {
        setHubSaveError(HUB_CATEGORIES_PERSISTENCE_UNAVAILABLE);
        return;
      }
      reportAdminApiError(error, { context: 'services-hub-categories-save', toast: true });
      setHubSaveError(mapAdminApiError(error).userMessage);
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

  const moveHubItem = (index: number, direction: -1 | 1) => {
    setHubDraft((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = prev.slice();
      const [row] = copy.splice(index, 1);
      if (!row) return prev;
      copy.splice(nextIndex, 0, row);
      return normalizeHubItems(copy);
    });
    setHubSaveError(null);
  };

  const toggleHubVisible = (index: number) => {
    setHubDraft((prev) =>
      prev.map((item, i) => (i === index ? { ...item, visible: !item.visible } : item)),
    );
    setHubSaveError(null);
  };

  return {
    category,
    setCategory,
    categories,
    hubItems: hubQuery.data?.items ?? [],
    hubDraft,
    moveHubItem,
    toggleHubVisible,
    saveHubMutation,
    hubSaveError,
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
