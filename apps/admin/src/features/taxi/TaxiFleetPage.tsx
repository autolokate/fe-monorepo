import type { AdminTaxiFleetVehicleDto } from '@autolokate/api-client';
import {
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlStack,
  type ColumnDef,
} from '@autolokate/ui';
import { useMemo } from 'react';

import { TaxiFleetDrawer } from '@/features/taxi/TaxiFleetDrawer';
import {
  TAXI_FLEET_CAN_BID_FILTERS,
  TAXI_FLEET_MEDIA_FILTERS,
  TAXI_FLEET_STATUS_FILTERS,
  taxiBidBlockerLabel,
  taxiMediaStatusTone,
  taxiRcTone,
  vehicleTitle,
} from '@/features/taxi/taxi-fleet-format';
import { useTaxiFleet } from '@/hooks/taxi/useTaxiFleet';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminLoadMore } from '@/platform/components/AdminLoadMore';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminStatusChip, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';
import { useUrlTextState } from '@/platform/state/useUrlTextState';
import { shortAdminId } from '@/platform/utils/format-admin-date';

import './taxi-v4.css';

const COLUMNS: ColumnDef<AdminTaxiFleetVehicleDto>[] = [
  {
    id: 'vehicle',
    header: 'Vehicle',
    accessorFn: (row) => row.registration,
    cell: ({ row }) => (
      <div className="taxi-fleet-cell">
        <span className="taxi-fleet-cell__primary admin-mono">{row.original.registration}</span>
        <span className="taxi-fleet-cell__secondary">{vehicleTitle(row.original)}</span>
      </div>
    ),
  },
  {
    id: 'org',
    header: 'Partner org',
    accessorFn: (row) => row.orgName ?? row.orgId,
    cell: ({ row }) => (
      <div className="taxi-fleet-cell">
        <span>{row.original.orgName ?? 'Unnamed org'}</span>
        <span className="taxi-fleet-cell__secondary admin-mono">
          {shortAdminId(row.original.orgId)}
        </span>
      </div>
    ),
  },
  {
    id: 'rc',
    header: 'RC',
    accessorFn: (row) => row.rcStatus,
    cell: ({ row }) => (
      <AdminStatusChip
        label={humanizeAdminLabel(row.original.rcStatus)}
        tone={taxiRcTone(row.original.rcStatus)}
      />
    ),
  },
  {
    id: 'media',
    header: 'Media',
    accessorFn: (row) => row.media.status,
    cell: ({ row }) => (
      <AdminStatusChip
        label={humanizeAdminLabel(row.original.media.status)}
        tone={taxiMediaStatusTone(row.original.media.status)}
      />
    ),
  },
  {
    id: 'driver',
    header: 'Driver',
    accessorFn: (row) => row.driver?.displayName ?? row.assignedDriver?.username ?? '',
    cell: ({ row }) => {
      const driver = row.original.driver;
      if (!driver) return <span className="taxi-note">Not set</span>;
      return (
        <div className="taxi-fleet-cell">
          <span>{driver.displayName ?? 'Name not set'}</span>
          <span className="taxi-fleet-cell__secondary">
            {driver.source === 'OWNER' ? 'Owner' : 'Assigned'} · photo{' '}
            {humanizeAdminLabel(driver.photo.status).toLowerCase()}
          </span>
        </div>
      );
    },
  },
  {
    id: 'bid',
    header: 'Bidding',
    enableSorting: false,
    cell: ({ row }) =>
      row.original.canBid ? (
        <AdminStatusChip label="Can bid" tone="active" />
      ) : (
        <div className="taxi-fleet-blockers">
          {(row.original.bidBlockers.length > 0 ? row.original.bidBlockers : ['BLOCKED']).map(
            (blocker) => (
              <AdminStatusChip key={blocker} label={taxiBidBlockerLabel(blocker)} tone="none" />
            ),
          )}
        </div>
      ),
  },
];

/** Taxi fleet (flow v3): why a partner can or cannot bid, and the media customers see. */
export function TaxiFleetPage() {
  const fleet = useTaxiFleet();
  const [selected, setSelected] = useUrlTextState('vehicle');
  const columns = useMemo(() => COLUMNS, []);

  return (
    <RequirePermission permission="taxi:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Taxi fleet"
          description="Fleet vehicles across taxi partners — RC, camera media freshness, driver and bid blockers. Open a vehicle to review or take down media."
          actions={
            <AlPageHeaderAction
              label={fleet.isFetching ? 'Refreshing…' : 'Refresh'}
              loading={fleet.isFetching}
              variant="secondary"
              onClick={fleet.refresh}
            />
          }
        />
        {fleet.notDeployed ? (
          <AdminNotDeployedState title="Taxi fleet" endpoint="GET /admin/v1/taxi/vehicles" />
        ) : fleet.userErrorMessage && fleet.vehicles.length === 0 ? (
          <AlErrorState message={fleet.userErrorMessage} onRetry={fleet.refresh} />
        ) : (
          <AdminDataBlock
            filters={
              <>
                <AdminFilterField label="Bidding">
                  <AdminFilterChips
                    options={TAXI_FLEET_CAN_BID_FILTERS}
                    value={fleet.canBid}
                    onChange={fleet.setCanBid}
                    aria-label="Can bid"
                  />
                </AdminFilterField>
                <AdminFilterField label="Media">
                  <AdminFilterChips
                    options={TAXI_FLEET_MEDIA_FILTERS}
                    value={fleet.mediaStatus}
                    onChange={fleet.setMediaStatus}
                    aria-label="Media status"
                  />
                </AdminFilterField>
                <AdminFilterField label="Status">
                  <AdminFilterChips
                    options={TAXI_FLEET_STATUS_FILTERS}
                    value={fleet.status}
                    onChange={fleet.setStatus}
                    aria-label="Fleet status"
                  />
                </AdminFilterField>
                <AdminFilterField label="Partner org id">
                  <input
                    className="taxi-fleet-filter-input"
                    data-testid="taxi-fleet-org-filter"
                    placeholder="Org UUID"
                    aria-label="Partner org id"
                    value={fleet.orgId}
                    onChange={(event) => {
                      fleet.setOrgId(event.target.value);
                    }}
                  />
                </AdminFilterField>
              </>
            }
          >
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="taxi-fleet"
              columns={columns}
              data={fleet.vehicles}
              loading={fleet.isLoading}
              isRefreshing={fleet.isFetching && !fleet.isFetchingNextPage}
              error={fleet.userErrorMessage}
              onRetry={fleet.refresh}
              enableGlobalSearch={false}
              emptyTitle="No fleet vehicles"
              emptyDescription="Nothing matches these filters."
              getRowId={(row) => row.id}
              onRowClick={(row) => {
                setSelected(row.id);
              }}
            />
            <AdminLoadMore
              hasMore={fleet.hasMore}
              loading={fleet.isFetchingNextPage}
              onLoadMore={fleet.loadMore}
              testId="taxi-fleet-load-more"
            />
          </AdminDataBlock>
        )}
        <TaxiFleetDrawer
          vehicleId={selected || null}
          onOpenChange={(open) => {
            if (!open) setSelected('');
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
