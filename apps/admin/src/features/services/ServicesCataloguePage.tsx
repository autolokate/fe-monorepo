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
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

import './services-catalogue.css';

/**
 * Admin Services catalogue authorship.
 * List: GET /admin/v1/services/providers. Hub: GET/PUT /admin/v1/services/hub-categories (0092).
 * Mutates: PUT /admin/v1/services/providers, DELETE /admin/v1/services/providers/{id}.
 */
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

  const pageDescription = useMemo(() => {
    if (isLoading && !data) {
      return 'Author consumer Services hub providers (no demo seed).';
    }
    return buildPageSummary([
      `${providers.length.toLocaleString()} providers in ${category}`,
      'INACTIVE via deactivate',
      'hub order/visibility via /admin/v1/services/hub-categories',
    ]);
  }, [category, data, isLoading, providers.length]);

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

        <p className="services-catalogue__note" data-testid="services-category-config-stub">
          Providers are Admin-authored only (no demo seed). Hub category order/visibility uses
          GET/PUT /admin/v1/services/hub-categories after migrate 0092; until then the API falls
          back to hardcoded hub tiles. Provider ACTIVE/INACTIVE still gates consumer visibility.
          {categoriesErrorMessage
            ? ` Hub categories GET failed (${categoriesErrorMessage}) — using defaults.`
            : null}
        </p>

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
            emptyDescription="Add a provider with PUT /admin/v1/services/providers. Consumer list stays empty until authored."
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
              ? `Soft-deactivate “${deactivateTarget.name}” via DELETE /admin/v1/services/providers/{id}. It leaves the consumer ACTIVE list.`
              : 'Soft-deactivate this provider.'
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
