import type { BatchSummaryDto, ReorderFulfilResultDto } from '@autolokate/api-client';
import {
  AlConfirmationDialog,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { BatchManagementDetailSheet } from '@/features/qr-batches/BatchManagementDetailSheet.js';
import { CreateBatchSheet } from '@/features/qr-batches/CreateBatchSheet.js';
import {
  FulfilPartnerReorderSheet,
  ReorderFulfilResultPanel,
} from '@/features/qr-batches/FulfilPartnerReorderSheet.js';
import { INVENTORY_STATE_FILTERS } from '@/features/inventory/inventory-filters.js';
import { useQrBatchColumns } from '@/features/qr-batches/qr-batch-columns.js';
import { useQrBatches } from '@/hooks/qr-batches/useQrBatches.js';
import { useQrBatchMutations } from '@/hooks/qr-batches/useQrBatchMutations.js';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock.js';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips.js';
import { AdminMoreActions } from '@/platform/components/AdminMoreActions.js';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props.js';
import { buildPageSummary } from '@/platform/components/build-page-summary.js';
import {
  useCanRunQrLifecycleMutations,
  useCanWriteInventoryMutations,
} from '@/platform/rbac/module-write-permissions.js';
import { RequirePermission } from '@/platform/rbac/RequirePermission.js';

import './qr-batches.css';

export function QrBatchManagementPage() {
  const {
    data,
    metrics,
    isLoading,
    isFetching,
    userErrorMessage,
    stateFilter,
    setStateFilter,
    refresh,
  } = useQrBatches();

  const canWriteBatches = useCanWriteInventoryMutations();
  const canRunLifecycle = useCanRunQrLifecycleMutations();
  const { sweepMutation } = useQrBatchMutations();

  const [selectedBatch, setSelectedBatch] = useState<BatchSummaryDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [sweepConfirmOpen, setSweepConfirmOpen] = useState(false);
  const [fulfilReorderOpen, setFulfilReorderOpen] = useState(false);
  const [fulfilReorderResult, setFulfilReorderResult] = useState<ReorderFulfilResultDto | null>(
    null,
  );

  const openBatch = useCallback((batch: BatchSummaryDto) => {
    setSelectedBatch(batch);
    setDetailOpen(true);
  }, []);

  const columns = useQrBatchColumns();
  const batches = data ?? [];

  useEffect(() => {
    if (!selectedBatch?.id || !data) {
      return;
    }
    const updated = data.find((batch) => batch.id === selectedBatch.id);
    if (!updated) {
      return;
    }
    setSelectedBatch((current) => (current?.id === updated.id && current !== updated ? updated : current));
  }, [data, selectedBatch?.id]);

  const handleBatchCreated = useCallback(
    (batch: BatchSummaryDto) => {
      openBatch(batch);
    },
    [openBatch],
  );

  const handleBatchUpdated = useCallback((batch: BatchSummaryDto) => {
    setSelectedBatch(batch);
  }, []);

  const pageDescription = useMemo(() => {
    if (isLoading || !metrics) {
      return 'Create batches, generate codes, and provision stock.';
    }
    return buildPageSummary([
      `${metrics.totalBatches.toLocaleString()} batches`,
      `${metrics.draftBatches.toLocaleString()} draft`,
      `${metrics.provisionedBatches.toLocaleString()} provisioned`,
    ]);
  }, [isLoading, metrics]);

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
          title="QR Batch Management"
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
              {canRunLifecycle ? (
                <AlPageHeaderAction
                  label="Fulfil reorder"
                  variant="secondary"
                  onClick={() => {
                    setFulfilReorderOpen(true);
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

        {fulfilReorderResult ? <ReorderFulfilResultPanel result={fulfilReorderResult} /> : null}

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
            tableId="qr-batches"
            columns={columns}
            data={batches}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && data ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search batch code or channel…"
            emptyTitle="No batches found"
            emptyDescription="Create a batch or try another status filter."
            getRowId={(row) => row.id}
            onRowClick={openBatch}
          />
        </AdminDataBlock>

        <CreateBatchSheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          onCreated={handleBatchCreated}
        />

        <BatchManagementDetailSheet
          batch={selectedBatch}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          canWrite={canRunLifecycle}
          onBatchUpdated={handleBatchUpdated}
        />

        <FulfilPartnerReorderSheet
          open={fulfilReorderOpen}
          onOpenChange={setFulfilReorderOpen}
          onFulfilled={setFulfilReorderResult}
        />

        <AlConfirmationDialog
          open={sweepConfirmOpen}
          onOpenChange={setSweepConfirmOpen}
          title="Run auto detach sweep"
          description="Reclaim unclaimed or unpaid attaches past the TTL and void provisional commission."
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
