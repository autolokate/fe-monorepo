import type { AdminTaxiRevenueDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  type ColumnDef,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { adminTaxiBookingPath } from '@/app/routes/admin-paths';
import {
  TAXI_REVENUE_KIND_FILTERS,
  TAXI_REVENUE_KIND_LABELS,
} from '@/features/taxi/taxi-ops-format';
import { useTaxiRevenue, type TaxiRevenueFilters } from '@/hooks/taxi/useTaxiOperations';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { formatAdminDateTime, formatPaise, shortAdminId } from '@/platform/utils/format-admin-date';

import './taxi-policy.css';

const COLUMNS: ColumnDef<AdminTaxiRevenueDto>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Recorded',
    cell: ({ row }) => formatAdminDateTime(row.original.createdAt),
  },
  {
    accessorKey: 'kind',
    header: 'Kind',
    cell: ({ row }) =>
      TAXI_REVENUE_KIND_LABELS[row.original.kind] ?? humanizeAdminLabel(row.original.kind),
  },
  {
    accessorKey: 'amountPaise',
    header: 'Amount',
    cell: ({ row }) => formatPaise(row.original.amountPaise),
  },
  {
    accessorKey: 'trigger',
    header: 'Trigger',
    cell: ({ row }) => humanizeAdminLabel(row.original.trigger),
  },
  {
    accessorKey: 'bookingId',
    header: 'Booking',
    cell: ({ row }) => <span className="admin-mono">{shortAdminId(row.original.bookingId)}</span>,
  },
  {
    accessorKey: 'orgId',
    header: 'Partner org',
    cell: ({ row }) => <span className="admin-mono">{shortAdminId(row.original.orgId)}</span>,
  },
  {
    accessorKey: 'policyVersionId',
    header: 'Policy',
    cell: ({ row }) => (
      <span className="admin-mono">{shortAdminId(row.original.policyVersionId)}</span>
    ),
  },
];

/** Autolokate taxi revenue ledger — booking fees earned/forfeited and deposits forfeited. */
export function TaxiRevenuePage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<TaxiRevenueFilters>({
    kind: 'ALL',
    bookingId: '',
    orgId: '',
  });
  const [draft, setDraft] = useState({ bookingId: '', orgId: '' });
  const ledger = useTaxiRevenue(filters);
  const pageTotal = useMemo(
    () => ledger.rows.reduce((sum, row) => sum + row.amountPaise, 0),
    [ledger.rows],
  );

  return (
    <RequirePermission permission="taxi:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Taxi revenue"
          description="Ledger rows written by the server when a booking fee is earned or forfeited, or a partner deposit is forfeited."
          actions={
            <AlPageHeaderAction
              label={ledger.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={ledger.isFetching}
              variant="secondary"
              onClick={ledger.refresh}
            />
          }
        />
        {ledger.notDeployed ? (
          <AdminNotDeployedState title="Taxi revenue" endpoint="GET /admin/v1/taxi/revenue" />
        ) : ledger.userErrorMessage && ledger.rows.length === 0 ? (
          <AlErrorState message={ledger.userErrorMessage} onRetry={ledger.refresh} />
        ) : (
          <AdminDataBlock
            filters={
              <>
                <AdminFilterField label="Kind">
                  <AdminFilterChips
                    options={TAXI_REVENUE_KIND_FILTERS}
                    value={filters.kind}
                    onChange={(kind) => {
                      setFilters((current) => ({ ...current, kind }));
                    }}
                    aria-label="Revenue kind"
                  />
                </AdminFilterField>
                <form
                  className="taxi-ops__lookup"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setFilters((current) => ({ ...current, ...draft }));
                  }}
                >
                  <input
                    placeholder="Booking id"
                    aria-label="Booking id"
                    value={draft.bookingId}
                    onChange={(event) => {
                      setDraft((d) => ({ ...d, bookingId: event.target.value }));
                    }}
                  />
                  <input
                    placeholder="Partner org id"
                    aria-label="Partner org id"
                    value={draft.orgId}
                    onChange={(event) => {
                      setDraft((d) => ({ ...d, orgId: event.target.value }));
                    }}
                  />
                  <AlButton type="submit" size="sm" variant="secondary">
                    Apply
                  </AlButton>
                </form>
              </>
            }
          >
            <p className="admin-empty-note" data-testid="taxi-revenue-page-total">
              {ledger.rows.length > 0
                ? `${String(ledger.rows.length)} rows loaded · ${formatPaise(pageTotal)} (loaded rows only, not a period total)`
                : null}
            </p>
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="taxi-revenue"
              columns={COLUMNS}
              data={ledger.rows}
              loading={ledger.isLoading}
              isRefreshing={ledger.isFetching && !ledger.isFetchingNextPage}
              error={ledger.userErrorMessage}
              onRetry={ledger.refresh}
              enableGlobalSearch={false}
              emptyTitle="No revenue rows"
              emptyDescription="Nothing matches these filters."
              getRowId={(row) => row.id}
              onRowClick={(row) => {
                void navigate(adminTaxiBookingPath(row.bookingId));
              }}
            />
            {ledger.hasMore ? (
              <div className="partners-load-more">
                <AlButton
                  variant="secondary"
                  size="sm"
                  loading={ledger.isFetchingNextPage}
                  onClick={ledger.loadMore}
                >
                  Load more
                </AlButton>
              </div>
            ) : null}
          </AdminDataBlock>
        )}
      </AlStack>
    </RequirePermission>
  );
}
