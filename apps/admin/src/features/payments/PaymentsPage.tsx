import type { AdminPaymentSummary } from '@autolokate/api-client';
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
import { AdminKpiStrip } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

/** Honest KPIs from the loaded page only — not catalog-wide totals. */
function pagePaymentKpis(payments: AdminPaymentSummary[]) {
  let paid = 0;
  let pending = 0;
  for (const payment of payments) {
    if (payment.outcome === 'PAID') paid += 1;
    else if (payment.outcome === 'PENDING' || payment.outcome === 'UNCONFIRMED') pending += 1;
  }
  return [
    { label: 'Paid', value: String(paid) },
    { label: 'Pending', value: String(pending) },
    { label: 'Total', value: String(payments.length) },
  ];
}

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
  const kpiItems = useMemo(
    () => (payments.length > 0 ? pagePaymentKpis(payments) : []),
    [payments],
  );

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
          description="Payment attempts and outcomes for customer orders."
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
