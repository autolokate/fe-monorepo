import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
} from '@autolokate/ui';
import { useMemo } from 'react';

import { PAYMENTS_OUTCOME_FILTERS } from '@/features/payments/payments-filters';
import { usePaymentsColumns } from '@/features/payments/payments-columns';
import { usePayments } from '@/hooks/payments/usePayments';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { buildPageSummary } from '@/platform/components/build-page-summary';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

export function PaymentsPage() {
  const {
    payments,
    isLoading,
    isFetching,
    userErrorMessage,
    outcomeFilter,
    setOutcomeFilter,
    refresh,
  } = usePayments();

  const columns = usePaymentsColumns();

  const pageDescription = useMemo(() => {
    if (isLoading) {
      return 'Browse payment attempts and their settled outcome.';
    }
    return buildPageSummary([`${payments.length.toLocaleString()} payments loaded`]);
  }, [isLoading, payments.length]);

  if (userErrorMessage && payments.length === 0) {
    return (
      <RequirePermission permission="payments:view">
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
    <RequirePermission permission="payments:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Payments"
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
            <AdminFilterField label="Outcome">
              <AdminFilterChips
                options={PAYMENTS_OUTCOME_FILTERS}
                value={outcomeFilter}
                onChange={setOutcomeFilter}
                aria-label="Payment outcome"
              />
            </AdminFilterField>
          }
        >
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="payments"
            columns={columns}
            data={payments}
            loading={isLoading}
            isRefreshing={isFetching}
            error={userErrorMessage && payments.length > 0 ? userErrorMessage : null}
            onRetry={refresh}
            globalSearchPlaceholder="Search order # or ref…"
            emptyTitle="No payments found"
            emptyDescription="Try another outcome filter."
            getRowId={(row) => row.paymentId}
          />
        </AdminDataBlock>
      </AlStack>
    </RequirePermission>
  );
}
