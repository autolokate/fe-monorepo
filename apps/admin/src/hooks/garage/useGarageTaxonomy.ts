import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  UpsertGarageTaxonomyItemBody,
  UpsertGarageTaxonomySubcategoryBody,
} from '@autolokate/api-client';

import {
  fetchGarageTaxonomy,
  saveGarageBusinessCategory,
  saveGarageSubcategory,
  saveGarageVehicleCategory,
} from '@/services/garage/garage-taxonomy-service';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';

export const garageTaxonomyQueryKey = ['admin', 'garage', 'taxonomy'] as const;

export function useGarageTaxonomy() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: garageTaxonomyQueryKey,
    queryFn: ({ signal }) => fetchGarageTaxonomy(signal),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: garageTaxonomyQueryKey });
  };

  const vehicleMutation = useMutation({
    mutationFn: (input: { id?: string; body: UpsertGarageTaxonomyItemBody }) =>
      saveGarageVehicleCategory(input),
    onSuccess: invalidate,
    onError: (error) => {
      reportAdminApiError(error, { context: 'garage-taxonomy-vehicle', toast: true });
    },
  });

  const categoryMutation = useMutation({
    mutationFn: (input: { id?: string; body: UpsertGarageTaxonomyItemBody }) =>
      saveGarageBusinessCategory(input),
    onSuccess: invalidate,
    onError: (error) => {
      reportAdminApiError(error, { context: 'garage-taxonomy-category', toast: true });
    },
  });

  const subcategoryMutation = useMutation({
    mutationFn: (input: { id?: string; body: UpsertGarageTaxonomySubcategoryBody }) =>
      saveGarageSubcategory(input),
    onSuccess: invalidate,
    onError: (error) => {
      reportAdminApiError(error, { context: 'garage-taxonomy-subcategory', toast: true });
    },
  });

  return {
    tree: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    userErrorMessage: query.isError ? mapAdminApiError(query.error).userMessage : null,
    vehicleSaveError: vehicleMutation.isError
      ? mapAdminApiError(vehicleMutation.error).userMessage
      : null,
    categorySaveError: categoryMutation.isError
      ? mapAdminApiError(categoryMutation.error).userMessage
      : null,
    subcategorySaveError: subcategoryMutation.isError
      ? mapAdminApiError(subcategoryMutation.error).userMessage
      : null,
    isSaving:
      vehicleMutation.isPending || categoryMutation.isPending || subcategoryMutation.isPending,
    saveVehicle: vehicleMutation.mutateAsync,
    saveCategory: categoryMutation.mutateAsync,
    saveSubcategory: subcategoryMutation.mutateAsync,
    refresh: () => query.refetch(),
  };
}
