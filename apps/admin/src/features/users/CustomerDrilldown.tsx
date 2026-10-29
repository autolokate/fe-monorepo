import { AlDataTable, AlErrorState, AlStack } from '@autolokate/ui';

import { useOrdersColumns } from '@/features/orders/orders-columns';
import { useSubscriptionsColumns } from '@/features/subscriptions/subscriptions-columns';
import { useAccountOrders } from '@/hooks/users/useAccountOrders';
import { useAccountSubscriptions } from '@/hooks/users/useAccountSubscriptions';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminPanel } from '@/platform/components/AdminWowSurface';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

/** The resolved customer's orders — reuses the orders console columns, scoped by `accountId`. */
function AccountOrdersSection({ accountId }: { accountId: string }) {
  const { orders, isLoading, isFetching, userErrorMessage, refresh } = useAccountOrders(accountId);
  const columns = useOrdersColumns();

  return (
    <AdminPanel title="Orders" subtitle="Orders placed by this customer.">
      {userErrorMessage && orders.length === 0 ? (
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      ) : (
        <AlDataTable
          {...ADMIN_LIST_TABLE_PROPS}
          tableId="account-orders"
          columns={columns}
          data={orders}
          loading={isLoading}
          isRefreshing={isFetching}
          error={userErrorMessage && orders.length > 0 ? userErrorMessage : null}
          onRetry={refresh}
          globalSearchPlaceholder="Search order #…"
          emptyTitle="No orders"
          emptyDescription="This customer has not placed any orders."
          getRowId={(row) => row.orderId}
        />
      )}
    </AdminPanel>
  );
}

/** The resolved customer's subscriptions — reuses the subscriptions console columns, scoped by `accountId`. */
function AccountSubscriptionsSection({ accountId }: { accountId: string }) {
  const { subscriptions, isLoading, isFetching, userErrorMessage, refresh } =
    useAccountSubscriptions(accountId);
  const columns = useSubscriptionsColumns();

  return (
    <AdminPanel title="Coverage" subtitle="Protection plans on this customer's vehicles.">
      {userErrorMessage && subscriptions.length === 0 ? (
        <AlErrorState message={userErrorMessage} onRetry={refresh} />
      ) : (
        <AlDataTable
          {...ADMIN_LIST_TABLE_PROPS}
          tableId="account-subscriptions"
          columns={columns}
          data={subscriptions}
          loading={isLoading}
          isRefreshing={isFetching}
          error={userErrorMessage && subscriptions.length > 0 ? userErrorMessage : null}
          onRetry={refresh}
          globalSearchPlaceholder="Search coverage…"
          emptyTitle="No coverage"
          emptyDescription="This customer has no active coverage yet."
          getRowId={(row) => row.subscriptionId}
        />
      )}
    </AdminPanel>
  );
}

export type CustomerDrilldownProps = {
  accountId: string;
};

/**
 * Once an account resolves, show that customer's Orders and Coverage scoped by accountId.
 * Each sub-table renders only when the operator holds the matching permission
 * (`orders:view` / `subscriptions:view`); a missing grant hides the block.
 */
export function CustomerDrilldown({ accountId }: CustomerDrilldownProps) {
  const canViewOrders = useAdminPermission('orders:view');
  const canViewSubscriptions = useAdminPermission('subscriptions:view');

  if (!canViewOrders && !canViewSubscriptions) {
    return null;
  }

  return (
    <AlStack gap="md" aria-label="Customer activity">
      {canViewOrders ? <AccountOrdersSection accountId={accountId} /> : null}
      {canViewSubscriptions ? <AccountSubscriptionsSection accountId={accountId} /> : null}
    </AlStack>
  );
}
