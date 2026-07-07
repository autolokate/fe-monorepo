import { CreditCardIcon, ScanLineIcon } from '@autolokate/icons';
import {
  AlDataTable,
  AlErrorState,
  AlGrid,
  AlMetricCard,
  AlPageHeader,
  AlPageHeaderAction,
  AlSectionHeader,
  AlStack,
  AlStatCard,
} from '@autolokate/ui';

import { DashboardAuditFeed } from '@/features/dashboard/DashboardAuditFeed.js';
import { dashboardBatchColumns } from '@/features/dashboard/dashboard-batch-columns.js';
import { useDashboard } from '@/hooks/dashboard/useDashboard.js';
import { MetricSkeleton } from '@/platform/components/MetricSkeleton.js';
import { RequirePermission } from '@/platform/rbac/RequirePermission.js';

import './dashboard.css';

const DASHBOARD_TABLE_PROPS = {
  enableGlobalSearch: false,
  enableColumnVisibility: false,
  enableRowSelection: false,
  enableDensitySwitch: false,
  enableCsvExport: false,
  enableCopyCell: false,
  stickyHeader: true,
} as const;

export function DashboardPage() {
  const {
    data,
    metrics,
    isLoading,
    isFetching,
    userErrorMessage,
    refresh,
  } = useDashboard();

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

  const recentBatches = data?.inventory.slice(0, 8) ?? [];
  const recentAuditEvents = data?.recentAuditEvents ?? [];

  return (
    <RequirePermission permission="dashboard:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Dashboard"
          description="Operational overview across inventory, promos, and audit activity."
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

        <div className="dashboard-layout">
          <section className="dashboard-layout__main">
            <AlSectionHeader title="Recent batches" />
            <AlDataTable
              {...DASHBOARD_TABLE_PROPS}
              tableId="dashboard-batches"
              columns={dashboardBatchColumns}
              data={recentBatches}
              loading={isLoading}
              isRefreshing={isFetching}
              pageSize={8}
              emptyTitle="No batches yet"
              emptyDescription="QR batches will appear here once created."
              getRowId={(row) => row.id}
            />
          </section>

          <DashboardAuditFeed events={recentAuditEvents} loading={isLoading} />
        </div>
      </AlStack>
    </RequirePermission>
  );
}
