import type { AdminRasRequestDto, AdminRasStatus } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlSheet,
  AlStack,
  type ColumnDef,
} from '@autolokate/ui';
import { useMemo, useState } from 'react';

import {
  useRoadsideRequest,
  useRoadsideRequests,
  type RasStatusFilter,
} from '@/hooks/roadside/useRoadsideRequests';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { AdminPageLoader } from '@/platform/components/AdminPageLoader';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import {
  AdminStatusChip,
  humanizeAdminLabel,
  shortAdminId,
  type AdminStatusChipTone,
} from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { formatAdminDateTime } from '@/platform/utils/format-admin-date';

import './roadside.css';

const STATUS_FILTERS: { value: RasStatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'REQUESTING', label: 'Requesting' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'EN_ROUTE', label: 'En route' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'FAILED', label: 'Failed' },
];

function statusTone(status: AdminRasStatus): AdminStatusChipTone {
  if (status === 'REQUESTING') return 'draft';
  if (status === 'ASSIGNED' || status === 'EN_ROUTE') return 'active';
  if (status === 'COMPLETED') return 'published';
  return 'none';
}

function RasStatusChip({ request }: { request: AdminRasRequestDto }) {
  return (
    <AdminStatusChip
      label={humanizeAdminLabel(request.statusCode)}
      tone={statusTone(request.statusCode)}
    />
  );
}

function MapLink({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return <>Not captured</>;
  return (
    <a
      className="admin-link"
      href={`https://www.google.com/maps/search/?api=1&query=${String(lat)},${String(lng)}`}
      target="_blank"
      rel="noreferrer noopener"
    >
      {lat.toFixed(5)}, {lng.toFixed(5)}
    </a>
  );
}

function RoadsideDetailSheet({
  requestId,
  onClose,
}: {
  requestId: string | null;
  onClose: () => void;
}) {
  const { data: request, isLoading, userErrorMessage } = useRoadsideRequest(requestId);
  return (
    <AlSheet
      open={requestId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title={request ? humanizeAdminLabel(request.issueType) : 'Roadside request'}
      description="Read-only. Provider dispatch happens in the RAS provider tools."
    >
      {isLoading ? <AdminPageLoader label="Loading request…" /> : null}
      {!isLoading && userErrorMessage ? (
        <p className="admin-form-error" role="alert">
          {userErrorMessage}
        </p>
      ) : null}
      {request ? (
        <AlStack gap="md">
          <div data-testid="roadside-detail">
            <AdminDetailSection title="Request">
              <AdminDetailGrid>
                <AdminDetailField label="Status" value={<RasStatusChip request={request} />} />
                <AdminDetailField label="Status text" value={request.status} />
                <AdminDetailField label="Issue" value={humanizeAdminLabel(request.issueType)} />
                <AdminDetailField label="Request" value={request.id} mono />
                <AdminDetailField label="Created" value={formatAdminDateTime(request.createdAt)} />
                <AdminDetailField label="Updated" value={formatAdminDateTime(request.updatedAt)} />
              </AdminDetailGrid>
            </AdminDetailSection>
          </div>
          <AdminDetailSection title="Customer & vehicle">
            <AdminDetailGrid>
              <AdminDetailField label="Account" value={request.accountId} mono />
              <AdminDetailField label="Vehicle" value={request.vehicleLabel} />
              <AdminDetailField label="Vehicle ID" value={request.vehicleId} mono />
            </AdminDetailGrid>
          </AdminDetailSection>
          <AdminDetailSection title="Location">
            <AdminDetailGrid>
              <AdminDetailField label="Place" value={request.locationLabel} />
              <AdminDetailField
                label="Point"
                value={<MapLink lat={request.latitude} lng={request.longitude} />}
              />
            </AdminDetailGrid>
          </AdminDetailSection>
          <AdminDetailSection title="Provider">
            <AdminDetailGrid>
              <AdminDetailField label="Provider" value={request.providerName ?? 'Not assigned'} />
              <AdminDetailField
                label="ETA"
                value={
                  typeof request.etaMinutes === 'number' ? `${String(request.etaMinutes)} min` : '—'
                }
              />
              {request.providerId ? (
                <AdminDetailField label="Provider ID" value={request.providerId} mono />
              ) : null}
            </AdminDetailGrid>
          </AdminDetailSection>
          <AdminDetailSection title="Customer's description">
            <p className="roadside-detail-text">{request.detail.trim() || 'No description.'}</p>
          </AdminDetailSection>
        </AlStack>
      ) : null}
    </AlSheet>
  );
}

export function RoadsideRequestsPage() {
  const list = useRoadsideRequests();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const columns = useMemo<ColumnDef<AdminRasRequestDto>[]>(
    () => [
      {
        id: 'createdAt',
        header: 'Created',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => formatAdminDateTime(row.original.createdAt),
      },
      {
        id: 'issue',
        header: 'Issue',
        accessorFn: (row) => row.issueType,
        cell: ({ row }) => humanizeAdminLabel(row.original.issueType),
      },
      { accessorKey: 'vehicleLabel', header: 'Vehicle' },
      {
        accessorKey: 'locationLabel',
        header: 'Location',
        cell: ({ row }) => <span className="roadside-cell-clip">{row.original.locationLabel}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        accessorFn: (row) => row.statusCode,
        cell: ({ row }) => <RasStatusChip request={row.original} />,
      },
      {
        id: 'provider',
        header: 'Provider',
        accessorFn: (row) => row.providerName ?? '',
        cell: ({ row }) => row.original.providerName ?? '—',
      },
      {
        id: 'eta',
        header: 'ETA',
        accessorFn: (row) => row.etaMinutes ?? -1,
        cell: ({ row }) =>
          typeof row.original.etaMinutes === 'number'
            ? `${String(row.original.etaMinutes)} min`
            : '—',
      },
      {
        id: 'account',
        header: 'Account',
        accessorFn: (row) => row.accountId,
        cell: ({ row }) => (
          <span className="admin-mono">{shortAdminId(row.original.accountId)}</span>
        ),
      },
    ],
    [],
  );

  return (
    <RequirePermission permission="support:view">
      <AlStack gap="md">
        <AlPageHeader
          title="Roadside assistance"
          description="Roadside assistance requests from the consumer app — status, vehicle, location and assigned provider. No phone or name is shown."
          actions={
            <AlPageHeaderAction
              label={list.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={list.isFetching}
              variant="secondary"
              onClick={list.refresh}
            />
          }
        />
        {list.notDeployed ? (
          <AdminNotDeployedState
            title="Roadside assistance"
            endpoint="GET /admin/v1/services/ras/requests"
          />
        ) : list.userErrorMessage && !list.data ? (
          <AlErrorState message={list.userErrorMessage} onRetry={list.refresh} />
        ) : (
          <>
            <AdminDataBlock
              filters={
                <AdminFilterField label="Status">
                  <AdminFilterChips
                    options={STATUS_FILTERS}
                    value={list.status}
                    onChange={list.setStatus}
                    aria-label="Roadside request status"
                  />
                </AdminFilterField>
              }
            >
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="roadside-requests"
                columns={columns}
                data={list.requests}
                loading={list.isLoading}
                isRefreshing={list.isFetching && !list.isFetchingNextPage}
                error={list.userErrorMessage && list.data ? list.userErrorMessage : null}
                onRetry={list.refresh}
                enableGlobalSearch={false}
                emptyTitle="No roadside requests"
                emptyDescription="No requests match this status."
                getRowId={(row) => row.id}
                onRowClick={(row) => {
                  setSelectedId(row.id);
                }}
              />
            </AdminDataBlock>
            <AdminLoadMore
              hasMore={list.hasNextPage}
              loading={list.isFetchingNextPage}
              testId="roadside-load-more"
              onLoadMore={() => {
                void list.fetchNextPage();
              }}
            />
          </>
        )}
        <RoadsideDetailSheet
          requestId={selectedId}
          onClose={() => {
            setSelectedId(null);
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
