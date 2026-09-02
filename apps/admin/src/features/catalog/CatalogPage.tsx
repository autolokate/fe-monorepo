import type { ApiPlanTier } from '@autolokate/api-client';
import { AlErrorState, AlPageHeader, AlPageHeaderAction, AlStack, AlTabs } from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { CatalogPlansTab } from '@/features/catalog/CatalogPlansTab';
import { CatalogSkusTab } from '@/features/catalog/CatalogSkusTab';
import { CreatePlanVersionSheet } from '@/features/catalog/CreatePlanVersionSheet';
import { CreateSkuSheet } from '@/features/catalog/CreateSkuSheet';
import { useCatalogPlans } from '@/hooks/catalog/useCatalogPlans';
import { useCatalogSkus } from '@/hooks/catalog/useCatalogSkus';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { useCanWriteCatalogMutations } from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { computeCatalogMetrics } from '@/services/catalog/catalog-model';

import './catalog.css';

type CatalogTab = 'plans' | 'skus';

/**
 * Plans and SKUs are one concept: a shelf may only name tiers that have an effective plan, and a SKU's
 * default plan must be on its own shelf. One page, one nav item, one permission.
 */
export function CatalogPage() {
  const plansState = useCatalogPlans();
  const skusState = useCatalogSkus();
  const canWrite = useCanWriteCatalogMutations();

  const [activeTab, setActiveTab] = useState<CatalogTab>('plans');
  const [createPlanOpen, setCreatePlanOpen] = useState(false);
  const [createSkuOpen, setCreateSkuOpen] = useState(false);
  const [newVersionTier, setNewVersionTier] = useState<ApiPlanTier | undefined>(undefined);

  const openNewVersion = useCallback((tier?: ApiPlanTier) => {
    setNewVersionTier(tier);
    setCreatePlanOpen(true);
  }, []);

  const metrics = useMemo(
    () => computeCatalogMetrics(plansState.plans, skusState.skus),
    [plansState.plans, skusState.skus],
  );

  const isLoading = plansState.isLoading || skusState.isLoading;
  const isFetching = plansState.isFetching || skusState.isFetching;

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Plans and the SKU shelves that sell them.';
    }
    return buildPageSummary([
      `${metrics.planVersions.toLocaleString()} plan versions`,
      `${metrics.livePlans.toLocaleString()} live`,
      `${metrics.skus.toLocaleString()} SKUs`,
      metrics.emptyShelves > 0 ? `${metrics.emptyShelves.toLocaleString()} empty shelves` : null,
    ]);
  }, [isLoading, metrics]);

  const refreshAll = useCallback(() => {
    plansState.refresh();
    skusState.refresh();
  }, [plansState, skusState]);

  // Only a hard failure with no data at all is a dead end; a stale list still renders with an inline error.
  const plansDead = plansState.userErrorMessage !== null && plansState.data === undefined;
  const skusDead = skusState.userErrorMessage !== null && skusState.data === undefined;

  if (plansDead && skusDead) {
    return (
      <RequirePermission permission="catalog:read">
        <AlErrorState
          message={plansState.userErrorMessage ?? 'Unable to load the catalog.'}
          onRetry={refreshAll}
        />
      </RequirePermission>
    );
  }

  const tabs = [
    {
      id: 'plans',
      label: 'Plans',
      content: (
        <CatalogPlansTab
          plans={plansState.filteredPlans}
          featureCountByPlanId={plansState.featureCountByPlanId}
          isLoading={plansState.isLoading}
          isFetching={plansState.isFetching}
          errorMessage={plansState.userErrorMessage}
          onRetry={plansState.refresh}
          tierFilter={plansState.tierFilter}
          onTierFilterChange={plansState.setTierFilter}
          canWrite={canWrite}
          onNewVersion={openNewVersion}
        />
      ),
    },
    {
      id: 'skus',
      label: 'SKUs',
      content: (
        <CatalogSkusTab
          skus={skusState.skus}
          plans={plansState.plans}
          isLoading={skusState.isLoading}
          isFetching={skusState.isFetching}
          errorMessage={skusState.userErrorMessage}
          onRetry={skusState.refresh}
          channelFilter={skusState.channelFilter}
          onChannelFilterChange={skusState.setChannelFilter}
          includeInactive={skusState.includeInactive}
          onIncludeInactiveChange={skusState.setIncludeInactive}
          canWrite={canWrite}
        />
      ),
    },
  ];

  return (
    <RequirePermission permission="catalog:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Catalog"
          description={pageDescription}
          actions={
            <>
              {canWrite ? (
                activeTab === 'plans' ? (
                  <AlPageHeaderAction
                    label="New version"
                    onClick={() => {
                      openNewVersion(undefined);
                    }}
                  />
                ) : (
                  <AlPageHeaderAction
                    label="New SKU"
                    onClick={() => {
                      setCreateSkuOpen(true);
                    }}
                  />
                )
              ) : null}
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refreshAll}
              />
            </>
          }
        />

        <AlTabs
          items={tabs}
          value={activeTab}
          onValueChange={(value) => {
            setActiveTab(value === 'skus' ? 'skus' : 'plans');
          }}
          ariaLabel="Catalog sections"
        />

        <CreatePlanVersionSheet
          open={createPlanOpen}
          onOpenChange={setCreatePlanOpen}
          plans={plansState.plans}
          initialTier={newVersionTier}
        />

        <CreateSkuSheet
          open={createSkuOpen}
          onOpenChange={setCreateSkuOpen}
          plans={plansState.plans}
        />
      </AlStack>
    </RequirePermission>
  );
}
