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
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

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

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Active protection per vehicle.';
    }
    return buildPageSummary([`${subscriptions.length.toLocaleString()} subscriptions loaded`]);
  }, [isLoading, subscriptions.length]);

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
          description={pageDescription}
          actions={
            <AlPageHeaderAction
              label={isFetching ? 'Refreshing…' : 'Refresh'}
              loading={isFetching}
              variant="secondary"
              onClick={refresh}
            />
          }
        />

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
            globalSearchPlaceholder="Search subscriptions…"
            emptyTitle="No subscriptions found"
            emptyDescription="Try another status filter."
            getRowId={(row) => row.subscriptionId}
          />
        </AdminDataBlock>
      </AlStack>
    </RequirePermission>
  );
}
