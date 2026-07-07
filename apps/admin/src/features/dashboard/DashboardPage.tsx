import type { BatchSummaryDto } from '@autolokate/api-client';
import { CreditCardIcon, ScanLineIcon } from '@autolokate/icons';
import {
  AlDataTable,
  AlErrorState,
  AlGrid,
  AlMetricCard,
  AlPageHeader,
  AlPageHeaderAction,
  AlSearchInput,
  AlStack,
  AlStatCard,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminPaths } from '@/app/routes/admin-paths.js';
import { dashboardBatchColumns } from '@/features/dashboard/dashboard-batch-columns.js';
import {
  INVENTORY_STATE_FILTERS,
  type InventoryStateFilter as InventoryFilterValue,
} from '@/features/inventory/inventory-filters.js';
import { useDashboard } from '@/hooks/dashboard/useDashboard.js';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock.js';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips.js';
import { MetricSkeleton } from '@/platform/components/MetricSkeleton.js';
import { RequirePermission } from '@/platform/rbac/RequirePermission.js';

import './dashboard.css';

const DASHBOARD_TABLE_PROPS = {
  enableColumnVisibility: false,
  enableRowSelection: false,
  enableDensitySwitch: false,
  enableCsvExport: false,
  enableCopyCell: false,
  enableGlobalSearch: false,
  stickyHeader: true,
  stickyToolbar: false,
} as const;

function matchesSearch(batch: BatchSummaryDto, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }
  return (
    batch.batchCode.toLowerCase().includes(normalized) ||
    batch.channel.toLowerCase().includes(normalized) ||
    batch.status.toLowerCase().includes(normalized)
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    data,
    metrics,
    isLoading,
    isFetching,
    userErrorMessage,
    refresh,
  } = useDashboard();

  const [stateFilter, setStateFilter] = useState<InventoryFilterValue>('ALL');
  const [search, setSearch] = useState('');

  const filteredBatches = useMemo(() => {
    const inventory = data?.inventory ?? [];
    return inventory
      .filter((batch) => stateFilter === 'ALL' || batch.status === stateFilter)
      .filter((batch) => matchesSearch(batch, search))
      .slice(0, 20);
  }, [data?.inventory, search, stateFilter]);

  if (userErrorMessage && !data) {
    return (
      <RequirePermission permission="dashboard:view">
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
    <RequirePermission permission="dashboard:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Dashboard"
          description="Overview of QR batches and platform health."
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

        <AlGrid columns={4} gap="md">
          {isLoading || !metrics ? (
            <>
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
              <MetricSkeleton />
            </>
          ) : (
            <>
              <AlStatCard
                label="QR batches"
                value={metrics.batchCount.toLocaleString()}
                icon={<ScanLineIcon size={18} aria-hidden />}
              />
              <AlMetricCard
                label="Provisioned codes"
                value={metrics.provisionedCodes.toLocaleString()}
              />
              <AlMetricCard
                label="In distribution"
                value={metrics.inDistributionBatches.toLocaleString()}
              />
              <AlStatCard
                label="Active promos"
                value={metrics.activePromos.toLocaleString()}
                icon={<CreditCardIcon size={18} aria-hidden />}
              />
            </>
          )}
        </AlGrid>

        <AdminDataBlock
          filters={
            <>
              <AdminFilterField label="Search">
                <AlSearchInput
                  value={search}
                  placeholder="Batch code, channel, status…"
                  ariaLabel="Search batches"
                  onChange={setSearch}
                />
              </AdminFilterField>
              <AdminFilterField label="Status">
                <AdminFilterChips
                  options={INVENTORY_STATE_FILTERS}
                  value={stateFilter}
                  onChange={setStateFilter}
                  aria-label="Batch status"
                />
              </AdminFilterField>
            </>
          }
        >
          <AlDataTable
            {...DASHBOARD_TABLE_PROPS}
            tableId="dashboard-batches"
            columns={dashboardBatchColumns}
            data={filteredBatches}
            loading={isLoading}
            isRefreshing={isFetching}
            pageSize={20}
            emptyTitle="No batches match your filters"
            emptyDescription="Try another status or clear the search."
            getRowId={(row) => row.id}
            onRowClick={() => {
              void navigate(adminPaths.inventory);
            }}
          />
        </AdminDataBlock>
      </AlStack>
    </RequirePermission>
  );
}
