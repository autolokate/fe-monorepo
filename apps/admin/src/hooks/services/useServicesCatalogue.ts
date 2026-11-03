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

/**
 * Category keys for the provider filter when the hub config has not loaded. Never used to seed an
 * editable hub draft after a failed GET (ADM-08: a save would overwrite live config with these).
 */
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

/** `AdminServiceProviderDto.category` enum (backend OpenAPI). */
const ADMIN_SERVICE_CATEGORIES: ServiceCategory[] = [
  'ras',
  'hospitals',
  'garages',
  'emergency',
  'roadside',
  'maintenance',
  'partners',
];

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

  // The draft is seeded ONLY from a successful GET. The server already falls back to its own default
  // list before migrate 0092, so an empty 200 is the one case where local defaults are offered.
  useEffect(() => {
    if (!hubQuery.isSuccess) {
      setHubDraft([]);
      return;
    }
    const items = hubQuery.data.items;
    setHubDraft(normalizeHubItems(items.length > 0 ? items : defaultHubItems()));
    setHubSaveError(null);
  }, [hubQuery.data, hubQuery.isSuccess]);

  /** Save is only allowed when the current server config was read successfully. */
  const hubEditable = hubQuery.isSuccess;
  const hubUsingDefaults = hubQuery.isSuccess && hubQuery.data.items.length === 0;

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
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => deactivateProvider(id, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: servicesCatalogueQueryKeys.all });
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'services-deactivate', toast: true });
    },
  });

  const saveHubMutation = useMutation({
    mutationFn: (items: ServiceHubCategoryItem[]) => {
      if (!hubQuery.isSuccess || items.length === 0) {
        return Promise.reject(
          new Error('Hub categories were not loaded from the server — refusing to overwrite them.'),
        );
      }
      return saveServiceHubCategories({ items: normalizeHubItems(items) });
    },
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

  // Providers can live in any backend category (hidden hub tiles and non-hub categories included), so
  // the admin filter offers visible hub tiles first, then every other category the server accepts.
  const categories: ServiceCategory[] = useMemo(() => {
    const items = hubQuery.data?.items ?? [];
    const visible = items.filter((item) => item.visible).map((item) => item.category);
    const ordered = visible.length > 0 ? visible : DEFAULT_SERVICE_HUB_CATEGORIES;
    return [...ordered, ...ADMIN_SERVICE_CATEGORIES.filter((value) => !ordered.includes(value))];
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
    hubEditable,
    hubUsingDefaults,
    retryHub: () => {
      void hubQuery.refetch();
    },
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
