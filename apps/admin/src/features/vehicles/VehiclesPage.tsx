import type { AdminPlateVehicleDto } from '@autolokate/api-client';
import {
  AlButton,
  AlDataTable,
  AlErrorState,
  AlPageHeader,
  AlPageHeaderAction,
  AlSheet,
  AlStack,
} from '@autolokate/ui';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { VehicleDriverInvitesPanel } from '@/features/users/DriverInvitesPanel';
import { VehicleRosterPanel } from '@/features/users/VehicleRosterPanel';
import {
  adminUserAccountPath,
  OwnerAccountLink,
  usePlateVehicleColumns,
} from '@/features/vehicles/plate-vehicle-columns';
import {
  PLATE_SEARCH_MIN_LENGTH,
  useVehiclePlateSearch,
} from '@/hooks/vehicles/useVehiclePlateSearch';
import { AdminDataBlock } from '@/platform/components/AdminDataBlock';
import {
  AdminDetailField,
  AdminDetailGrid,
  AdminDetailSection,
} from '@/platform/components/AdminDetailField';
import { AdminNotDeployedState } from '@/platform/components/AdminNotDeployedState';
import { ADMIN_LIST_TABLE_PROPS } from '@/platform/components/admin-list-table-props';
import { AdminPanel, humanizeAdminLabel } from '@/platform/components/AdminWowSurface';
import { RequirePermission } from '@/platform/rbac/RequirePermission';

import '@/features/users/users-v4.css';

function VehicleDrawer({
  vehicle,
  onOpenChange,
}: {
  vehicle: AdminPlateVehicleDto | null;
  onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  return (
    <AlSheet
      open={vehicle !== null}
      onOpenChange={onOpenChange}
      title={vehicle?.registration ?? 'Vehicle'}
      description="Owner, protection, driver roster and invites for this vehicle."
    >
      {vehicle ? (
        <div className="admin-v4-wide-drawer" data-testid="vehicle-drawer">
          <AlStack gap="md">
            <AdminDetailSection title="Vehicle">
              <AdminDetailGrid>
                <AdminDetailField label="Registration" value={vehicle.registration} mono />
                <AdminDetailField label="Plate key" value={vehicle.plateKey ?? 'Unparsed'} mono />
                <AdminDetailField
                  label="Make / model"
                  value={[vehicle.make, vehicle.model].filter(Boolean).join(' ') || '—'}
                />
                <AdminDetailField label="Colour" value={vehicle.color ?? '—'} />
                <AdminDetailField
                  label="Protection"
                  value={humanizeAdminLabel(vehicle.protection)}
                />
                <AdminDetailField
                  label="Ownership"
                  value={vehicle.ownershipVerified ? 'RC verified' : 'Not verified'}
                />
                <AdminDetailField
                  label="Owner account"
                  value={<OwnerAccountLink accountId={vehicle.ownerAccountId} />}
                />
                <AdminDetailField label="Vehicle id" value={vehicle.vehicleId} mono />
              </AdminDetailGrid>
            </AdminDetailSection>
            <VehicleRosterPanel
              vehicleId={vehicle.vehicleId}
              currentAccountId=""
              testId="vehicle-drawer-roster"
              onOpenAccount={(accountId) => {
                void navigate(adminUserAccountPath(accountId));
              }}
            />
            <VehicleDriverInvitesPanel
              vehicleId={vehicle.vehicleId}
              testId="vehicle-drawer-invites"
            />
          </AlStack>
        </div>
      ) : null}
    </AlSheet>
  );
}

/**
 * Find a vehicle by registration (`GET /admin/v1/vehicles?plate=`, matched on the normalized plate
 * key so "KA 01 AB 1234" and "ka01ab1234" are the same). The plate lives in the URL (`?plate=`).
 */
export function VehiclesPage() {
  const [params, setParams] = useSearchParams();
  const applied = params.get('plate') ?? '';
  const [draft, setDraft] = useState(applied);
  const [selected, setSelected] = useState<AdminPlateVehicleDto | null>(null);
  const search = useVehiclePlateSearch(applied);
  const columns = usePlateVehicleColumns();

  const submit = () => {
    const next = draft.trim();
    setParams(
      (current) => {
        const copy = new URLSearchParams(current);
        if (next) copy.set('plate', next);
        else copy.delete('plate');
        return copy;
      },
      { replace: true },
    );
  };

  return (
    <RequirePermission permission="users:read">
      <AlStack gap="md">
        <AlPageHeader
          title="Vehicles"
          description="Find a vehicle by registration — its owner, protection, drivers and driver invites."
          actions={
            search.enabled ? (
              <AlPageHeaderAction
                label={search.isFetching ? 'Refreshing…' : 'Refresh'}
                loading={search.isFetching}
                variant="secondary"
                onClick={search.refresh}
              />
            ) : undefined
          }
        />

        <AdminPanel
          title="Search by registration"
          subtitle="Spaces, dashes and case don't matter. The full registration is shown to operators only."
        >
          <form
            className="admin-v4-search"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <label className="admin-field">
              Registration
              <input
                autoComplete="off"
                spellCheck={false}
                placeholder="KA01AB1234"
                data-testid="vehicles-plate-input"
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                }}
              />
            </label>
            <AlButton
              type="submit"
              size="sm"
              data-testid="vehicles-plate-submit"
              disabled={draft.replace(/[^a-z0-9]/gi, '').length < PLATE_SEARCH_MIN_LENGTH}
              loading={search.isLoading}
            >
              Search
            </AlButton>
          </form>
        </AdminPanel>

        {search.notDeployed ? (
          <AdminNotDeployedState
            title="Vehicle search"
            endpoint="GET /admin/v1/vehicles?plate="
            description="Search by registration is not available on this server yet."
          />
        ) : search.enabled ? (
          search.error ? (
            <AlErrorState message={search.error} onRetry={search.refresh} />
          ) : (
            <AdminDataBlock>
              <AlDataTable
                {...ADMIN_LIST_TABLE_PROPS}
                tableId="vehicles-plate-results"
                columns={columns}
                data={search.vehicles}
                loading={search.isLoading}
                enableGlobalSearch={false}
                emptyTitle="No vehicle with that registration"
                emptyDescription="Check the registration, or look under Plate scanning → Unparsed plates for vehicles whose plate couldn't be keyed."
                getRowId={(row) => row.vehicleId}
                onRowClick={setSelected}
              />
            </AdminDataBlock>
          )
        ) : null}

        <VehicleDrawer
          vehicle={selected}
          onOpenChange={(open) => {
            if (!open) setSelected(null);
          }}
        />
      </AlStack>
    </RequirePermission>
  );
}
