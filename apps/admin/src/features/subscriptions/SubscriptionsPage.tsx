import type { AdminSubscriptionSummary } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useMemo } from 'react';

import { SUBSCRIPTIONS_STATUS_FILTERS } from '@/features/subscriptions/subscriptions-filters';
import { useSubscriptionsColumns } from '@/features/subscriptions/subscriptions-columns';
import { useSubscriptions } from '@/hooks/subscriptions/useSubscriptions';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminKpiStrip } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Honest KPIs from the loaded page only — not catalog-wide totals. */
function pageCoverageKpis(subscriptions: AdminSubscriptionSummary[]) {
  let active = 0;
  for (const row of subscriptions) {
    if (row.status === 'ACTIVE') active += 1;
  }
  return [
    { label: 'Active', value: String(active) },
    { label: 'Total', value: String(subscriptions.length) },
  ];
}

export function SubscriptionsPage() {
  const {
    subscriptions,
    isLoading,
    isFetching,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useSubscriptions();

  const columns = useSubscriptionsColumns();
  const kpiItems = useMemo(
    () => (subscriptions.length > 0 ? pageCoverageKpis(subscriptions) : []),
    [subscriptions],
  );

  if (userErrorMessage && subscriptions.length === 0) {
    return (
      <RequirePermission permission="subscriptions:view">
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
    <RequirePermission permission="subscriptions:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Coverage"
          description="Active protection plans per vehicle."
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

        {!isLoading && kpiItems.length > 0 ? <AdminKpiStrip items={kpiItems} /> : null}

        <AdminDataBlock
          filters={
            <AdminFilterField label="Status">
              <AdminFilterChips
                options={SUBSCRIPTIONS_STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
                aria-label="Subscription status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="subscriptions"
            columns={columns}
            data={subscriptions}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && subscriptions.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search coverage…"
            emptyTitle="No coverage found"
            emptyDescription="Try another status filter."
            getRowId={(row) => row.subscriptionId}
          />
        </AdminDataBlock>
      </AlStack>
    </RequirePermission>
  );
}
