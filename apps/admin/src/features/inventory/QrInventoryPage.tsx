import type { BatchSummaryDto } from '@autolokate/api-client';
import {
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminInventoryBatchPath } from '@/app/routes/admin-paths';
import { CreateBatchSheet } from '@/features/qr-batches/CreateBatchSheet';
import { INVENTORY_STATE_FILTERS } from '@/features/inventory/inventory-filters';
import { useInventoryColumns } from '@/features/inventory/inventory-columns';
import { useQrInventory } from '@/hooks/inventory/useQrInventory';
import { useQrBatchMutations } from '@/hooks/qr-batches/useQrBatchMutations';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminMoreActions } from '@/platform/components/AdminMoreActions';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip } from '@/platform/components/AdminWowSurface';
import {
  useCanRunQrLifecycleMutations,
  useCanWriteInventoryMutations,
} from '@/platform/rbac/module-write-permissions';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import './inventory.css';

export function QrInventoryPage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, userErrorMessage, stateFilter, setStateFilter, refresh } =
    useQrInventory();

  const canWriteBatches = useCanWriteInventoryMutations();
  const canRunLifecycle = useCanRunQrLifecycleMutations();
  const { sweepMutation } = useQrBatchMutations();

  const [createOpen, setCreateOpen] = useState(false);
  const [sweepConfirmOpen, setSweepConfirmOpen] = useState(false);

  const openBatch = useCallback(
    (batch: BatchSummaryDto) => {
      void navigate(adminInventoryBatchPath(batch.id), { state: { batch } });
    },
    [navigate],
  );

  const columns = useInventoryColumns();
  const batches = useMemo(() => data ?? [], [data]);

  const handleBatchCreated = useCallback(
    (batch: BatchSummaryDto) => {
      openBatch(batch);
    },
    [openBatch],
  );

  const pageDescription = 'Browse QR stock batches and open a row to manage codes.';

  const kpiItems = useMemo(() => {
    if (batches.length === 0) return [];
    const totalCodes = batches.reduce((sum, batch) => sum + batch.totalCount, 0);
    const generated = batches.reduce((sum, batch) => sum + batch.generatedCount, 0);
    return [
      { label: 'Batches (page)', value: String(batches.length) },
      { label: 'Codes', value: totalCodes.toLocaleString() },
      { label: 'Generated', value: generated.toLocaleString() },
    ];
  }, [batches]);

  const moreActions = useMemo(
    () =>
      canRunLifecycle
        ? [
            {
              id: 'auto-detach-sweep',
              label: 'Run auto detach sweep',
              loading: sweepMutation.isPending,
              onClick: () => {
                setSweepConfirmOpen(true);
              },
            },
          ]
        : [],
    [canRunLifecycle, sweepMutation.isPending],
  );

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="inventory:view">
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
    <RequirePermission permission="inventory:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Stock"
          description={pageDescription}
          actions={
            <>
              {canWriteBatches ? (
                <AlPageHeaderAction
                  label="Create batch"
                  onClick={() => {
                    setCreateOpen(true);
                  }}
                />
              ) : null}
              <AdminMoreActions actions={moreActions} />
              <AlPageHeaderAction
                label={isFetching ? 'Refreshing…' : 'Refresh'}
                loading={isFetching}
                variant="secondary"
                onClick={refresh}
              />
            </>
          }
        />

        {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

        <AdminDataBlock
          filters={
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={INVENTORY_STATE_FILTERS}
                value={stateFilter}
                onChange={setStateFilter}
                aria-label="Batch status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="qr-inventory"
            columns={columns}
            data={batches}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search batch code or channel…"
            emptyTitle="No batches found"
            emptyDescription="Try another status filter or create a batch."
            getRowId={(row) => row.id}
            onRowClick={openBatch}
          />
        </AdminDataBlock>

        <CreateBatchSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleBatchCreated}
        />

        <AlConfirmationDialog
          open={sweepConfirmOpen}
          onOpenChange={setSweepConfirmOpen}
          title="Run auto detach sweep"
          description="Reclaim QR attaches that were never claimed or paid after the wait window, and cancel any pending commission."
          confirmLabel="Run sweep"
          loading={sweepMutation.isPending}
          onConfirm={() => {
            void sweepMutation.mutateAsync(undefined).finally(() => {
              setSweepConfirmOpen(false);
            });
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
