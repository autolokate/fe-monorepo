import type { AdminOrderSummary } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useState } from 'react';

import { OrderDetailSheet } from '@/features/orders/OrderDetailSheet';
import { ORDERS_STATUS_FILTERS } from '@/features/orders/orders-filters';
import { useOrdersColumns } from '@/features/orders/orders-columns';
import { RefundOrderDialog } from '@/features/orders/RefundOrderDialog';
import { useOrders } from '@/hooks/orders/useOrders';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
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

  // Nest has no POST …/orders/{orderId}/refund (product-blocked). Keep CTA off regardless of RBAC.
  const canRefund = false;
  const [refundTarget, setRefundTarget] = useState<AdminOrderSummary | null>(null);
  const [detailOrder, setDetailOrder] = useState<AdminOrderSummary | null>(null);

  const columns = useOrdersColumns({ canRefund, onRefund: setRefundTarget });

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
          description="Customer QR commerce orders from Nest. Open a row for money and partner detail."
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
            onRowClick={(row) => {
              setDetailOrder(row);
            }}
          />
        </AdminDataBlock>

        <OrderDetailSheet
          orderId={detailOrder?.orderId ?? null}
          orderNumber={detailOrder?.orderNumber ?? null}
          open={Boolean(detailOrder)}
          onOpenChange={(open) => {
            if (!open) {
              setDetailOrder(null);
            }
          }}
        />

        <RefundOrderDialog
          order={refundTarget}
          onOpenChange={(open) => {
            if (!open) {
              setRefundTarget(null);
            }
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
