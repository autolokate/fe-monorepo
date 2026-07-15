import type { PlanFeaturesDto } from '@autolokate/api-client';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { catalogQueryKeys, legacySkuQueryKeyPrefix } from '@/hooks/catalog/catalog-query-keys';
import { mapAdminApiError, resolveSubmitErrorMessage } from '@/platform/errors/admin-api-errors';
import { reportAdminApiError } from '@/platform/errors/report-admin-api-error';
import { showSuccessToast } from '@/platform/feedback/toast';
import {
  createCatalogPlanVersion,
  createCatalogSku,
  saveCatalogPlanFeatures,
  updateCatalogPlanLifecycle,
  updateCatalogSku,
} from '@/services/catalog/admin-catalog-service';
import { formatPlanRef } from '@/services/catalog/catalog-model';

function upsertById(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  entity: { id: string },
  options: { appendIfMissing?: boolean } = {},
) {
  queryClient.setQueriesData<{ id: string }[]>({ queryKey }, (current) => {
    if (!current) {
      return current;
    }
    const index = current.findIndex((entry) => entry.id === entity.id);
    if (index === -1) {
      return options.appendIfMissing ? [entity, ...current] : current;
    }
    const next = current.slice();
    next[index] = entity;
    return next;
  });
}

export function useCatalogMutations() {
  const queryClient = useQueryClient();

  const invalidatePlans = async () => {
    await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.plans() });
  };

  const invalidateSkus = async () => {
    await queryClient.invalidateQueries({ queryKey: catalogQueryKeys.skus() });
    // The create-batch picker caches SKUs under its own key — keep it honest after a shelf edit.
    await queryClient.invalidateQueries({ queryKey: legacySkuQueryKeyPrefix });
  };

  const createPlanVersionMutation = useMutation({
    mutationFn: ({
      body,
      signal,
    }: {
      body: Parameters<typeof createCatalogPlanVersion>[0];
      signal?: AbortSignal;
    }) => createCatalogPlanVersion(body, signal),
    retry: 0,
    onSuccess: async (plan) => {
      upsertById(queryClient, catalogQueryKeys.plans(), plan, {
        appendIfMissing: true,
      });
      await invalidatePlans();
      // A new version can put a tier back on the shelf — SKU pickers read from the plan list.
      await invalidateSkus();
      showSuccessToast(
        `Minted ${formatPlanRef(plan)} — features copied forward from the outgoing version.`,
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'catalog:create-plan-version', toast: true });
    },
  });

  const updatePlanLifecycleMutation = useMutation({
    mutationFn: ({
      planId,
      body,
      signal,
    }: {
      planId: string;
      body: Parameters<typeof updateCatalogPlanLifecycle>[1];
      signal?: AbortSignal;
    }) => updateCatalogPlanLifecycle(planId, body, signal),
    retry: 0,
    onSuccess: async (plan) => {
      upsertById(queryClient, catalogQueryKeys.plans(), plan);
      await invalidatePlans();
      await invalidateSkus();
      showSuccessToast(
        plan.isEffectiveNow
          ? `${formatPlanRef(plan)} is live.`
          : `${formatPlanRef(plan)} is no longer live.`,
      );
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'catalog:update-plan-lifecycle', toast: true });
    },
  });

  const updatePlanFeaturesMutation = useMutation({
    mutationFn: ({
      planId,
      body,
      signal,
    }: {
      planId: string;
      body: Parameters<typeof saveCatalogPlanFeatures>[1];
      signal?: AbortSignal;
    }) => saveCatalogPlanFeatures(planId, body, signal),
    retry: 0,
    onSuccess: async (features: PlanFeaturesDto) => {
      queryClient.setQueryData(catalogQueryKeys.planFeatures(features.planId), features);
      await queryClient.invalidateQueries({
        queryKey: catalogQueryKeys.planFeatures(features.planId),
      });
      showSuccessToast(`Saved ${String(features.features.length)} feature bullets.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'catalog:update-plan-features', toast: true });
    },
  });

  const createSkuMutation = useMutation({
    mutationFn: ({
      body,
      signal,
    }: {
      body: Parameters<typeof createCatalogSku>[0];
      signal?: AbortSignal;
    }) => createCatalogSku(body, signal),
    retry: 0,
    onSuccess: async (sku) => {
      upsertById(queryClient, catalogQueryKeys.skus(), sku, {
        appendIfMissing: true,
      });
      await invalidateSkus();
      showSuccessToast(`SKU ${sku.skuCode} created.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'catalog:create-sku', toast: true });
    },
  });

  const updateSkuMutation = useMutation({
    mutationFn: ({
      skuId,
      body,
      signal,
    }: {
      skuId: string;
      body: Parameters<typeof updateCatalogSku>[1];
      signal?: AbortSignal;
    }) => updateCatalogSku(skuId, body, signal),
    retry: 0,
    onSuccess: async (sku) => {
      upsertById(queryClient, catalogQueryKeys.skus(), sku);
      await invalidateSkus();
      showSuccessToast(`SKU ${sku.skuCode} updated.`);
    },
    onError: (error) => {
      reportAdminApiError(error, { context: 'catalog:update-sku', toast: true });
    },
  });

  return {
    createPlanVersionMutation,
    updatePlanLifecycleMutation,
    updatePlanFeaturesMutation,
    createSkuMutation,
    updateSkuMutation,
    mapMutationError: mapAdminApiError,
    resolveSubmitError: resolveSubmitErrorMessage,
  };
}
