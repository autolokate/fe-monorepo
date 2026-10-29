import type { AdminPlanDto } from '@autolokate/api-client';
import { AlConfirmationDialog, AlDataTable, AlStack } from '@autolokate/ui';
import { useCallback, useState } from 'react';

import { PLAN_TIER_FILTERS } from '@/features/catalog/catalog-filters';
import { EditPlanFeaturesSheet } from '@/features/catalog/EditPlanFeaturesSheet';
import { usePlanColumns } from '@/features/catalog/plan-columns';
import { PlanVersionDetailSheet } from '@/features/catalog/PlanVersionDetailSheet';
import type { PlanTierFilter } from '@/hooks/catalog/useCatalogPlans';
import { useCatalogMutations } from '@/hooks/catalog/useCatalogMutations';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { formatPlanRef } from '@/services/catalog/catalog-model';

export type CatalogPlansTabProps = {
  plans: AdminPlanDto[];
  featureCountByPlanId: ReadonlyMap<string, number | null>;
  isLoading: boolean;
  isFetching: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  tierFilter: PlanTierFilter;
  onTierFilterChange: (filter: PlanTierFilter) => void;
  canWrite: boolean;
  onNewVersion: (tier?: AdminPlanDto['tier']) => void;
};

export function CatalogPlansTab({
  plans,
  featureCountByPlanId,
  isLoading,
  isFetching,
  errorMessage,
  onRetry,
  tierFilter,
  onTierFilterChange,
  canWrite,
  onNewVersion,
}: CatalogPlansTabProps) {
  const columns = usePlanColumns(featureCountByPlanId);
  const { updatePlanLifecycleMutation } = useCatalogMutations();

  const [selectedPlan, setSelectedPlan] = useState<AdminPlanDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);

  const openPlan = useCallback((plan: AdminPlanDto) => {
    setSelectedPlan(plan);
    setDetailOpen(true);
  }, []);

  const runLifecycle = useCallback(
    (plan: AdminPlanDto, publish: boolean) => {
      const nowIso = new Date().toISOString();
      updatePlanLifecycleMutation.mutate(
        {
          planId: plan.id,
          // Publish opens the window from now and clears any end stamp; retire closes it as of now.
          body: publish ? { effectiveFrom: nowIso, effectiveTo: null } : { effectiveTo: nowIso },
        },
        {
          onSuccess: () => {
            setDetailOpen(false);
            setRetireOpen(false);
          },
        },
      );
    },
    [updatePlanLifecycleMutation],
  );

  return (
    <AlStack gap="md">
      <p className="admin-empty-note">
        Prices and names are locked once live — create a new version to change them. Feature bullets
        on a version can still be edited.
      </p>

      <AdminDataBlock
        filters={
          <AdminFilterField label="Tier">
            <AdminFilterChips
              options={PLAN_TIER_FILTERS}
              value={tierFilter}
              onChange={onTierFilterChange}
              aria-label="Plan tier"
            />
          </AdminFilterField>
        }
      >
        <AlDataTable
          {...ADMIN_LIST_TABLE_PROPS}
          tableId="catalog-plans"
          columns={columns}
          data={plans}
          loading={isLoading}
          isRefreshing={isFetching}
          error={errorMessage}
          onRetry={onRetry}
          globalSearchPlaceholder="Search plan name…"
          emptyTitle="No plan versions found"
          emptyDescription="Mint a new version or clear the tier filter."
          getRowId={(row) => row.id}
          onRowClick={openPlan}
        />
      </AdminDataBlock>

      <PlanVersionDetailSheet
        plan={selectedPlan}
        featureCount={selectedPlan ? (featureCountByPlanId.get(selectedPlan.id) ?? null) : null}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        canWrite={canWrite}
        lifecyclePending={updatePlanLifecycleMutation.isPending}
        onEditFeatures={() => {
          setFeaturesOpen(true);
        }}
        onNewVersion={() => {
          setDetailOpen(false);
          onNewVersion(selectedPlan?.tier);
        }}
        onPublish={() => {
          if (selectedPlan) {
            runLifecycle(selectedPlan, true);
          }
        }}
        onRetire={() => {
          setRetireOpen(true);
        }}
      />

      <EditPlanFeaturesSheet
        plan={selectedPlan}
        open={featuresOpen}
        onOpenChange={setFeaturesOpen}
      />

      <AlConfirmationDialog
        open={retireOpen}
        onOpenChange={setRetireOpen}
        title={selectedPlan ? `Retire ${formatPlanRef(selectedPlan)}?` : 'Retire plan version?'}
        description="This closes the version's effective window, so it can no longer be sold. Existing subscribers keep their pinned version and price — nothing is repriced."
        confirmLabel="Retire version"
        destructive
        loading={updatePlanLifecycleMutation.isPending}
        onConfirm={() => {
          if (selectedPlan) {
            runLifecycle(selectedPlan, false);
          }
        }}
      />
    </AlStack>
  );
}
