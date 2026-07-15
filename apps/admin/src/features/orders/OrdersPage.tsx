import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useMemo } from 'react';

import { ORDERS_STATUS_FILTERS } from '@/features/orders/orders-filters';
import { useOrdersColumns } from '@/features/orders/orders-columns';
import { useOrders } from '@/hooks/orders/useOrders';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

export function OrdersPage() {
  const {
    orders,
    isLoading,
    isFetching,
    userErrorMessage,
    statusFilter,
    setStatusFilter,
    refresh,
  } = useOrders();

  const columns = useOrdersColumns();

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Browse customer orders and their fulfilment status.';
    }
    return buildPageSummary([`${orders.length.toLocaleString()} orders loaded`]);
  }, [isLoading, orders.length]);

  if (userErrorMessage && orders.length === 0) {
    return (
      <RequirePermission permission="orders:view">
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
    <RequirePermission permission="orders:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Orders"
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
                options={ORDERS_STATUS_FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
                aria-label="Order status"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="orders"
            columns={columns}
            data={orders}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && orders.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search order #…"
            emptyTitle="No orders found"
            emptyDescription="Try another status filter."
            getRowId={(row) => row.orderId}
          />
        </AdminDataBlock>
      </AlStack>
    </RequirePermission>
  );
}
