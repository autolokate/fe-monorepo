import type { AdminPlateCollisionDto } from '@autolokate/api-client';
import { AlButton, AlDataTable, AlErrorState, AlModal, type ColumnDef } from '@autolokate/ui';
import { useMemo, useState } from 'react';

import {
  OwnerAccountLink,
  usePlateVehicleColumns,
} from '@/features/vehicles/plate-vehicle-columns';
import {
  useActiveVehicleDuplicates,
  usePlateCollisions,
  useUnparsedPlates,
} from '@/hooks/plate-scanning/usePlateScanning';
import { AdminDataBlock, AdminFilterField } from '@/platform/components/AdminDataBlock';
import { AdminFilterChips } from '@/platform/components/AdminFilterChips';
import { AdminMutationResultPanel } from '@/platform/components/AdminMutationResultPanel';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminPanel, AdminStatusChip, shortAdminId } from '@/platform/components/AdminWowSurface';
import { mapAdminApiError } from '@/platform/errors/admin-api-errors';
import { useAdminPermission } from '@/platform/rbac/useAdminPermission';
import { useUrlFilterState } from '@/platform/state/useUrlFilterState';

const LIMIT_OPTIONS = [
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
] as const;
type LimitOption = (typeof LIMIT_OPTIONS)[number]['value'];
const LIMIT_VALUES = LIMIT_OPTIONS.map((option) => option.value);

/** Plate keys claimed by more than one vehicle. Once an RC is approved for a plate, it wins alerts. */
export function PlateCollisionsTab() {
  const [limit, setLimit] = useUrlFilterState<LimitOption>('limit', '50', LIMIT_VALUES);
  const collisions = usePlateCollisions(Number(limit));

  const columns = useMemo<ColumnDef<AdminPlateCollisionDto>[]>(
    () => [
      {
        accessorKey: 'plateKey',
        header: 'Plate key',
        cell: ({ row }) => <span className="admin-mono">{row.original.plateKey}</span>,
      },
      { accessorKey: 'vehicleCount', header: 'Vehicles' },
      {
        accessorKey: 'verifiedCount',
        header: 'RC verified',
        cell: ({ row }) => (
          <AdminStatusChip
            label={String(row.original.verifiedCount)}
            tone={row.original.verifiedCount > 0 ? 'active' : 'none'}
          />
        ),
      },
      {
        id: 'vehicles',
        header: 'Claims',
        enableSorting: false,
        cell: ({ row }) => (
          <ul className="admin-v4-stack" aria-label={`Vehicles on ${row.original.plateKey}`}>
            {row.original.vehicles.map((vehicle) => (
              <li key={vehicle.vehicleId} className="admin-v4-tags">
                <span className="admin-mono">{vehicle.registration}</span>
                <span className="admin-v4-stack__secondary">
                  {[vehicle.make, vehicle.model].filter(Boolean).join(' ') || 'Unknown vehicle'}
                </span>
                <OwnerAccountLink accountId={vehicle.ownerAccountId} />
                <span
                  className={`admin-v4-tag${vehicle.ownershipVerified ? '' : ' admin-v4-tag--warning'}`}
                >
                  {vehicle.ownershipVerified ? 'RC verified' : 'Unverified'}
                </span>
              </li>
            ))}
          </ul>
        ),
      },
    ],
    [],
  );

  if (collisions.notDeployed) {
    return (
      <AdminNotDeployedState
        title="Plate collisions"
        endpoint="GET /admin/v1/vehicles/plate-collisions"
        description="Plate collision review is not available on this server yet."
      />
    );
  }
  return (
    <AdminDataBlock
      filters={
        <AdminFilterField label="Show">
          <AdminFilterChips
            options={LIMIT_OPTIONS}
            value={limit}
            onChange={setLimit}
            aria-label="Collision limit"
          />
        </AdminFilterField>
      }
    >
      <p className="admin-empty-note">
        The same plate on several unverified accounts: every claimant gets approximate-area alerts
        only. Once one RC is approved for the plate, that vehicle wins and the other unverified
        claims stop receiving alerts.
      </p>
      {collisions.error ? (
        <AlErrorState message={collisions.error} onRetry={collisions.refresh} />
      ) : (
        <div data-testid="plate-collisions">
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="plate-collisions-table"
            columns={columns}
            data={collisions.data ?? []}
            loading={collisions.isLoading}
            enableGlobalSearch={false}
            emptyTitle="No plate collisions"
            emptyDescription="Every plate key belongs to one vehicle."
            getRowId={(row) => row.plateKey}
          />
        </div>
      )}
    </AdminDataBlock>
  );
}

/** Vehicles whose registration couldn't be parsed into a plate key — plus the batched backfill. */
export function UnparsedPlatesTab() {
  const canWrite = useAdminPermission('users:write');
  const unparsed = useUnparsedPlates(100);
  const columns = usePlateVehicleColumns();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { backfillMutation } = unparsed;
  const result = backfillMutation.data;
  const backfillError = backfillMutation.isError
    ? mapAdminApiError(backfillMutation.error).userMessage
    : null;

  if (unparsed.notDeployed) {
    return (
      <AdminNotDeployedState
        title="Unparsed plates"
        endpoint="GET /admin/v1/vehicles/plate-keys/unparsed"
        description="Plate-key review is not available on this server yet."
      />
    );
  }

  return (
    <>
      <AdminPanel
        title="Plate-key backfill"
        subtitle="Keys up to 1,000 vehicles without a plate key per batch. Re-run while vehicles remain."
        meta={
          canWrite ? (
            <AlButton
              size="sm"
              data-testid="plate-backfill-run"
              loading={backfillMutation.isPending}
              onClick={() => {
                backfillMutation.reset();
                setConfirmOpen(true);
              }}
            >
              Run backfill batch
            </AlButton>
          ) : null
        }
      >
        {result ? (
          <div className="admin-v4-result" data-testid="plate-backfill-result">
            <AdminMutationResultPanel
              title="Last batch"
              fields={[
                { label: 'Processed', value: String(result.processed) },
                { label: 'Keyed', value: String(result.keyed) },
                { label: 'Unparsed', value: String(result.unparsed) },
                {
                  label: 'Remaining',
                  value:
                    result.remaining > 0
                      ? `${String(result.remaining)} — run another batch`
                      : '0 — backfill complete',
                },
              ]}
            />
          </div>
        ) : (
          <p className="admin-empty-note">No batch run in this session.</p>
        )}
        {backfillError && !confirmOpen ? (
          <p className="admin-form-error" role="alert">
            {backfillError}
          </p>
        ) : null}
      </AdminPanel>

      <AdminDataBlock>
        {unparsed.error ? (
          <AlErrorState message={unparsed.error} onRetry={unparsed.refresh} />
        ) : (
          <div data-testid="plate-unparsed">
            <AlDataTable
              {...ADMIN_LIST_TABLE_PROPS}
              tableId="plate-unparsed-table"
              columns={columns}
              data={unparsed.data ?? []}
              loading={unparsed.isLoading}
              enableGlobalSearch={false}
              emptyTitle="No unparsed plates"
              emptyDescription="Every keyed registration parsed into a plate key."
              getRowId={(row) => row.vehicleId}
            />
          </div>
        )}
      </AdminDataBlock>

      <AlModal
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open && !backfillMutation.isPending) setConfirmOpen(false);
        }}
        title="Run one backfill batch?"
        description="Computes plate keys for up to 1,000 vehicles that don't have one. Safe to re-run; vehicles whose registration can't be parsed stay listed here."
        footer={
          <div className="admin-modal-actions">
            <AlButton
              variant="secondary"
              disabled={backfillMutation.isPending}
              onClick={() => {
                setConfirmOpen(false);
              }}
            >
              Cancel
            </AlButton>
            <AlButton
              data-testid="plate-backfill-confirm"
              loading={backfillMutation.isPending}
              onClick={() => {
                backfillMutation.mutate(undefined, {
                  onSuccess: () => {
                    setConfirmOpen(false);
                  },
                });
              }}
            >
              Run batch
            </AlButton>
          </div>
        }
      >
        {backfillError ? (
          <p className="admin-form-error" role="alert">
            {backfillError}
          </p>
        ) : null}
      </AlModal>
    </>
  );
}

type DuplicateRow = { vehicleId: string; subscriptionIds: string[] };

/** Pre-deploy check for migration 0146 (one ACTIVE plan per vehicle). */
export function DuplicatePlansTab() {
  const duplicates = useActiveVehicleDuplicates();
  const columns = useMemo<ColumnDef<DuplicateRow>[]>(
    () => [
      {
        accessorKey: 'vehicleId',
        header: 'Vehicle',
        cell: ({ row }) => <span className="admin-mono">{row.original.vehicleId}</span>,
      },
      {
        id: 'count',
        header: 'Active plans',
        accessorFn: (row) => row.subscriptionIds.length,
      },
      {
        id: 'subscriptions',
        header: 'Subscriptions',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="admin-v4-tags">
            {row.original.subscriptionIds.map((id) => (
              <span key={id} className="admin-v4-tag admin-mono" title={id}>
                {shortAdminId(id)}
              </span>
            ))}
          </span>
        ),
      },
    ],
    [],
  );

  if (duplicates.notDeployed) {
    return (
      <AdminNotDeployedState
        title="Duplicate active plans"
        endpoint="GET /admin/v1/subscriptions/active-vehicle-duplicates"
        description="The duplicate-plan check is not available on this server yet."
      />
    );
  }
  const data = duplicates.data;
  return (
    <AdminPanel
      title="Duplicate active plans per vehicle"
      subtitle="Migration 0146 adds a unique index allowing one ACTIVE plan per vehicle. It is skip-and-report: with duplicates it completes without the index — reconcile these, then create the index by hand."
      meta={
        data ? (
          <span data-testid="plate-duplicates-index">
            <AdminStatusChip
              label={data.indexPresent ? 'Unique index present' : 'Unique index missing'}
              tone={data.indexPresent ? 'active' : 'draft'}
            />
          </span>
        ) : null
      }
    >
      {duplicates.error ? (
        <AlErrorState message={duplicates.error} onRetry={duplicates.refresh} />
      ) : (
        <div data-testid="plate-duplicates">
          <AlDataTable
            {...ADMIN_LIST_TABLE_PROPS}
            tableId="plate-duplicates-table"
            columns={columns}
            data={data?.duplicates ?? []}
            loading={duplicates.isLoading}
            enableGlobalSearch={false}
            emptyTitle="No duplicates"
            emptyDescription="No vehicle has more than one ACTIVE plan."
            getRowId={(row) => row.vehicleId}
          />
        </div>
      )}
    </AdminPanel>
  );
}
