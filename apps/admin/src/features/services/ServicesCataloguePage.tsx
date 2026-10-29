import type { AdminServiceProviderDto } from '@autolokate/api-client';
import {
  AlButton,
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  AlText,
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
    hubDraft,
    moveHubItem,
    toggleHubVisible,
    saveHubMutation,
    hubSaveError,
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
          title="Hub categories"
          subtitle="Reorder hub tiles and toggle visibility for the consumer Services hub."
          meta={
            canWrite ? (
              <AlButton
                variant="primary"
                size="sm"
                data-testid="services-hub-categories-save"
                loading={saveHubMutation.isPending}
                onClick={() => {
                  saveHubMutation.mutate(hubDraft);
                }}
              >
                Save
              </AlButton>
            ) : null
          }
        >
          {categoriesErrorMessage ? (
            <p className="admin-empty-note" data-testid="services-category-config-stub">
              Hub categories could not be loaded — editing defaults. ({categoriesErrorMessage})
            </p>
          ) : null}

          <ul className="services-hub-list" data-testid="services-hub-categories">
            {hubDraft.map((item, index) => (
              <li key={item.category} className="services-hub-row">
                <div className="services-hub-row__main">
                  <span className="services-hub-row__label">
                    {item.label?.trim() || item.category}
                  </span>
                  <span className="services-hub-row__meta">{item.category}</span>
                </div>
                <div className="services-hub-row__actions">
                  <label className="services-hub-visible">
                    <input
                      type="checkbox"
                      checked={item.visible}
                      disabled={!canWrite}
                      data-testid={`services-hub-visible-${item.category}`}
                      onChange={() => {
                        toggleHubVisible(index);
                      }}
                    />
                    Visible
                  </label>
                  <AlButton
                    variant="secondary"
                    size="sm"
                    disabled={!canWrite || index === 0}
                    data-testid={`services-hub-up-${item.category}`}
                    onClick={() => {
                      moveHubItem(index, -1);
                    }}
                  >
                    Up
                  </AlButton>
                  <AlButton
                    variant="secondary"
                    size="sm"
                    disabled={!canWrite || index === hubDraft.length - 1}
                    data-testid={`services-hub-down-${item.category}`}
                    onClick={() => {
                      moveHubItem(index, 1);
                    }}
                  >
                    Down
                  </AlButton>
                </div>
              </li>
            ))}
          </ul>

          {hubSaveError ? (
            <AlText tone="muted" role="alert" data-testid="services-hub-categories-error">
              {hubSaveError}
            </AlText>
          ) : (
            <p className="admin-empty-note">
              Filter providers by category below after saving hub order and visibility.
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
