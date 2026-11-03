import type { AdminGarageRevenueDto } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  type ColumnDef,
} from '@autolokate/ui';
import { Link } from 'react-router-dom';

import { adminPartnerPath } from '@/app/routes/admin-paths';
import { useGarageRevenue } from '@/hooks/garage/useGarageAccess';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { formatAdminDateTime, formatPaise, shortAdminId } from '@/platform/utils/format-admin-date';

import './garage-v4.css';

const KIND_LABELS: Record<string, string> = {
  DAY_PASS: '24-hour pass',
  MONTH_PASS: 'Monthly pass',
};

const COLUMNS: ColumnDef<AdminGarageRevenueDto>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Paid',
    cell: ({ row }) => formatAdminDateTime(row.original.createdAt),
  },
  {
    id: 'org',
    header: 'Garage',
    accessorFn: (row) => row.orgName ?? row.orgId,
    cell: ({ row }) => (
      <Link
        className="admin-link"
        to={adminPartnerPath(row.original.orgId)}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {row.original.orgName ?? shortAdminId(row.original.orgId)}
      </Link>
    ),
  },
  {
    accessorKey: 'kind',
    header: 'Pass',
    cell: ({ row }) => KIND_LABELS[row.original.kind] ?? row.original.kind,
  },
  {
    accessorKey: 'amountPaise',
    header: 'Amount (incl. GST)',
    cell: ({ row }) => formatPaise(row.original.amountPaise),
  },
  {
    accessorKey: 'paymentRef',
    header: 'Payment ref',
    cell: ({ row }) => <span className="admin-mono">{row.original.paymentRef}</span>,
  },
  {
    id: 'providerOrderId',
    header: 'Provider order',
    accessorFn: (row) => row.providerOrderId ?? '',
    cell: ({ row }) => <span className="admin-mono">{row.original.providerOrderId ?? '—'}</span>,
  },
];

/** Garage revenue = pass sales (flow v3): PAID partner checkouts; admin grants are excluded. */
export function GarageRevenuePage() {
  const revenue = useGarageRevenue();

  return (
    <RequirePermission permission="partners:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Garage pass revenue"
          description="24-hour and monthly pass sales from paid partner checkouts. Admin-granted passes are not revenue and are excluded."
          actions={
            <AlPageHeaderAction
              label={revenue.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={revenue.isFetching}
              variant="secondary"
              onClick={revenue.refresh}
            />
          }
        />
        {revenue.notDeployed ? (
          <AdminNotDeployedState
            title="Garage pass revenue"
            endpoint="GET /admin/v1/garage/revenue"
          />
        ) : revenue.userErrorMessage && revenue.rows.length === 0 && !revenue.isLoading ? (
          <AlErrorState message={revenue.userErrorMessage} onRetry={revenue.refresh} />
        ) : (
          <AdminDataBlock
            filters={
              <>
                <AdminFilterField label="From">
                  <input
                    type="date"
                    className="garage-v4-filter-input"
                    aria-label="From date"
                    data-testid="garage-revenue-from"
                    value={revenue.from}
                    onChange={(event) => {
                      revenue.setFrom(event.target.value);
                    }}
                  />
                </AdminFilterField>
                <AdminFilterField label="To (inclusive)">
                  <input
                    type="date"
                    className="garage-v4-filter-input"
                    aria-label="To date"
                    data-testid="garage-revenue-to"
                    value={revenue.to}
                    onChange={(event) => {
                      revenue.setTo(event.target.value);
                    }}
                  />
                </AdminFilterField>
                <AdminFilterField label="Garage org id">
                  <input
                    className="garage-v4-filter-input garage-v4-filter-input--wide"
                    aria-label="Garage org id"
                    placeholder="Org UUID"
                    data-testid="garage-revenue-org"
                    value={revenue.orgId}
                    onChange={(event) => {
                      revenue.setOrgId(event.target.value);
                    }}
                  />
                </AdminFilterField>
              </>
            }
          >
            {revenue.inverted ? (
              <p className="garage-v4-error" role="alert">
                The end date is before the start date.
              </p>
            ) : null}
            <p className="garage-v4-note" data-testid="garage-revenue-total">
              {revenue.rows.length > 0 ? (
                <>
                  <span className="garage-v4-total">{formatPaise(revenue.loadedTotalPaise)}</span>{' '}
                  on loaded rows ({String(revenue.rows.length)}) — not a period total until every
                  page is loaded.{' '}
                </>
              ) : null}
              Amounts are GST-inclusive; GST is not snapshotted per sale and pass refunds are not
              recorded, so they do not appear here.
            </p>
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="garage-revenue"
              columns={COLUMNS}
              data={revenue.rows}
              loading={revenue.isLoading}
              isRefreshing={revenue.isFetching && !revenue.isFetchingNextPage}
              error={revenue.userErrorMessage}
              onRetry={revenue.refresh}
              enableGlobalSearch={false}
              emptyTitle="No pass sales"
              emptyDescription="No paid pass checkouts match these filters."
              getRowId={(row) => row.id}
            />
            <AdminLoadMore
              hasMore={revenue.hasMore}
              loading={revenue.isFetchingNextPage}
              onLoadMore={revenue.loadMore}
              testId="garage-revenue-load-more"
            />
          </AdminDataBlock>
        )}
      </AlStack>
    </RequirePermission>
  );
}
