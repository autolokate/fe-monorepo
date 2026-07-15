import { AlDataTable, AlErrorState, AlStack, AlText } from '@autolokate/ui';

import { useOrdersColumns } from '@/features/orders/orders-columns';
import { useSubscriptionsColumns } from '@/features/subscriptions/subscriptions-columns';
import { useAccountOrders } from '@/hooks/users/useAccountOrders';
import { useAccountSubscriptions } from '@/hooks/users/useAccountSubscriptions';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';

/** The resolved customer's orders — reuses the orders console columns, scoped by `accountId`. */
function AccountOrdersSection({ accountId }: { accountId: string }) {
  const { orders, isLoading, isFetching, userErrorMessage, refresh } = useAccountOrders(accountId);
  const columns = useOrdersColumns();

  return (
    <AlStack gap="xs">
      <AlText variant="caption" tone="muted">
        Orders
      </AlText>
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
    </AlStack>
  );
}

/** The resolved customer's subscriptions — reuses the subscriptions console columns, scoped by `accountId`. */
function AccountSubscriptionsSection({ accountId }: { accountId: string }) {
  const { subscriptions, isLoading, isFetching, userErrorMessage, refresh } =
    useAccountSubscriptions(accountId);
  const columns = useSubscriptionsColumns();

  return (
    <AlStack gap="xs">
      <AlText variant="caption" tone="muted">
        Coverage
      </AlText>
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
          globalSearchPlaceholder="Search subscriptions…"
          emptyTitle="No subscriptions"
          emptyDescription="This customer has no subscriptions yet."
          getRowId={(row) => row.subscriptionId}
        />
      )}
    </AlStack>
  );
}

export type CustomerDrilldownProps = {
  accountId: string;
};

/**
 * Once an account resolves, show that customer's Orders and Subscriptions by composing the existing
 * admin-list endpoints with their `accountId` filter — no new routes. Each sub-table renders only if
 * the operator already holds the matching console permission (`orders:view` / `subscriptions:view`),
 * so a missing grant hides the block rather than throwing an access-denied panel inside this page.
 */
export function CustomerDrilldown({ accountId }: CustomerDrilldownProps) {
  const canViewOrders = useAdminPermission('orders:view');
  const canViewSubscriptions = useAdminPermission('subscriptions:view');

  if (!canViewOrders && !canViewSubscriptions) {
    return null;
  }

  return (
    <section className="admin-user-activity" aria-label="Customer activity">
      <AlStack gap="lg">
        <AlText variant="caption" tone="muted">
          Customer activity
        </AlText>
        {canViewOrders ? <AccountOrdersSection accountId={accountId} /> : null}
        {canViewSubscriptions ? <AccountSubscriptionsSection accountId={accountId} /> : null}
      </AlStack>
    </section>
  );
}
