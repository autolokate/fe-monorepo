import type { AdminServiceProviderDto } from '@autolokate/api-client';
import {
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';

import { useServicesColumns } from '@/features/services/services-columns';
import { UpsertServiceProviderSheet } from '@/features/services/UpsertServiceProviderSheet';
import { useServicesCatalogue } from '@/hooks/services/useServicesCatalogue';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip, AdminPanel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './services-catalogue.css';

export function ServicesCataloguePage() {
  const canWrite = useAdminPermission('settings:write');
  const {
    category,
    setCategory,
    categories,
    providers,
    isLoading,
    isFetching,
    userErrorMessage,
    categoriesErrorMessage,
    upsertMutation,
    deactivateMutation,
    refresh,
    data,
  } = useServicesCatalogue('ras');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AdminServiceProviderDto | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<AdminServiceProviderDto | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openCreate = useCallback(() => {
    setEditing(null);
    setSheetOpen(true);
  }, []);

  const openEdit = useCallback((row: AdminServiceProviderDto) => {
    setEditing(row);
    setSheetOpen(true);
  }, []);

  const columns = useServicesColumns({
    onEdit: openEdit,
    onDeactivate: setDeactivateTarget,
    canWrite,
    busyId,
  });

  const categoryFilters = useMemo(
    () =>
      categories.map((value) => ({
        value,
        label: value,
      })),
    [categories],
  );

  const pageDescription = 'Service providers shown in the consumer Services hub.';

  const kpiItems = useMemo(() => {
    if (providers.length === 0) return [];
    const active = providers.filter((row) => row.status === 'ACTIVE').length;
    const verified = providers.filter((row) => row.verifiedPartner).length;
    return [
      { label: 'On this page', value: String(providers.length) },
      { label: 'Active', value: String(active) },
      { label: 'Verified', value: String(verified) },
    ];
  }, [providers]);

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="settings:read">
        <AlErrorState
          message={userErrorMessage}
          onRetry={() => {
            refresh();
          }}
        />
      </RequirePermission>
    );
  }

  return (
    <RequirePermission permission="settings:read">
      <AlStack gap="md" data-testid="services-catalogue-page">
        <AlPageHeader
          title="Services catalogue"
          description={pageDescription}
          actions={
            <>
              {canWrite ? <AlPageHeaderAction label="Add provider" onClick={openCreate} /> : null}
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={() => {
                  refresh();
                }}
              />
            </>
          }
        />

        <AdminPanel
          title="Hub visibility"
          subtitle="Providers appear in the consumer hub when Active. Deactivate to hide them."
        >
          {categoriesErrorMessage ? (
            <p className="admin-empty-note" data-testid="services-category-config-stub">
              Hub categories could not be loaded — using defaults. ({categoriesErrorMessage})
            </p>
          ) : (
            <p className="admin-empty-note" data-testid="services-category-config-stub">
              Filter by category, then add or edit providers for that list.
            </p>
          )}
        </AdminPanel>

        {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

        <AdminDataBlock
          filters={
            <AdminFilterField label="Category">
              <AdminFilterChips
                options={categoryFilters}
                value={category}
                onChange={(next) => {
                  setCategory(next);
                }}
                aria-label="Service category"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="services-catalogue"
            columns={columns}
            data={providers}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && providers.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search provider…"
            emptyTitle="No providers in this category"
            emptyDescription="Add a provider to show it in the consumer Services hub."
            getRowId={(row) => row.id}
            onRowClick={canWrite ? openEdit : undefined}
          />
        </AdminDataBlock>

        <UpsertServiceProviderSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          categories={categories}
          initial={editing}
          defaultCategory={category}
          busy={upsertMutation.isPending}
          error={upsertMutation.isError ? upsertMutation.error : null}
          onSubmit={async (body) => {
            await upsertMutation.mutateAsync(body);
          }}
        />

        <AlConfirmationDialog
          open={Boolean(deactivateTarget)}
          onOpenChange={(open) => {
            if (!open) setDeactivateTarget(null);
          }}
          title="Deactivate provider?"
          description={
            deactivateTarget
              ? `Deactivate “${deactivateTarget.name}”? It will leave the consumer Active list.`
              : 'Deactivate this provider?'
          }
          confirmLabel="Deactivate"
          destructive
          loading={deactivateMutation.isPending}
          onConfirm={() => {
            if (!deactivateTarget) return;
            const target = deactivateTarget;
            setBusyId(target.id);
            void deactivateMutation
              .mutateAsync(target.id)
              .then(() => {
                setDeactivateTarget(null);
              })
              .catch(() => {
                // Toast via mutation.
              })
              .finally(() => {
                setBusyId(null);
              });
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
