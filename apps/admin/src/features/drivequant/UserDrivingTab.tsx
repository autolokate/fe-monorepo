import type { AdminUserEntitlementsDto, AdminUserTripDto } from '@autolokate/api-client';
import { AlStack } from '@autolokate/ui';
import { useCallback, useState } from 'react';

import { DqChip } from '@/features/drivequant/dq-ui';
import { formatIst, type VehicleIdentity } from '@/features/drivequant/driving-status';
import { UserCrashesPanel } from '@/features/drivequant/UserCrashesPanel';
import { UserTripDetailSheet } from '@/features/drivequant/UserTripDetailSheet';
import { UserDriveQuantPanel } from '@/features/users/UserDriveQuantPanel';
import { AdminDetailField, AdminDetailGrid } from '@/platform/components/AdminDetailField';
import { AdminPanel, shortAdminId } from '@/platform/components/AdminWowSurface';

/** A crash only carries the trip id — the drawer fills the rest from the detail read. */
function tripStub(tripId: string): AdminUserTripDto {
  return {
    tripId,
    vehicleId: null,
    startedAt: null,
    endedAt: null,
    distanceKm: null,
    durationMinutes: null,
    drivingDurationMinutes: null,
    scores: { safety: null, eco: null, distraction: null, speeding: null },
    verified: true,
    receivedAt: '',
    source: 'PUSH',
  };
}

export type DrivingEntitlementState = {
  data: AdminUserEntitlementsDto | null;
  isLoading: boolean;
  error: string | null;
};

function EntitlementChip({ state }: { state: DrivingEntitlementState }) {
  if (state.isLoading) return <span className="admin-muted">Checking…</span>;
  if (state.error || !state.data) return <span className="admin-muted">Unavailable</span>;
  return state.data.features.driveQuant ? (
    <DqChip label="Entitled — own paid plan" tone="info" />
  ) : (
    <DqChip label="Not entitled" tone="warning" />
  );
}

/**
 * Driving overview: who and which vehicles. Entitlement is the account's OWN paid plan right now
 * (an owner's plan never covers a driver). Consent is recorded per event, so it is shown on each
 * crash event rather than guessed here.
 */
function DrivingOverview({
  userId,
  name,
  vehicles,
  entitlements,
}: {
  userId: string;
  name: string | null;
  vehicles: readonly VehicleIdentity[];
  entitlements: DrivingEntitlementState;
}) {
  const plates = vehicles.map((vehicle) => vehicle.plate).filter(Boolean);
  return (
    <AdminPanel
      title="Driving Activity"
      subtitle="Trips, driver score and crash events for this account. Every read is audited."
    >
      <div data-testid="driving-overview">
        <AdminDetailGrid>
          <AdminDetailField label="Customer" value={name ?? 'Name not shown'} />
          <AdminDetailField label="Account id" value={shortAdminId(userId)} mono />
          <AdminDetailField
            label="Vehicles on account"
            value={plates.length > 0 ? plates.join(', ') : 'None'}
          />
          <AdminDetailField
            label="Driving Activity plan"
            value={<EntitlementChip state={entitlements} />}
          />
          {entitlements.data?.expiresAt ? (
            <AdminDetailField
              label="Plan renews / expires"
              value={formatIst(entitlements.data.expiresAt)}
            />
          ) : null}
          <AdminDetailField
            label="Consent"
            value={<span className="admin-muted">Recorded on each crash event</span>}
          />
        </AdminDetailGrid>
        <p className="admin-muted dq-footnote">All times are India Standard Time (IST).</p>
      </div>
    </AdminPanel>
  );
}

/** User detail → Driving: overview, trips + driver score, trip drawer, crash events. */
export function UserDrivingTab({
  userId,
  name = null,
  vehicles = [],
  entitlements = { data: null, isLoading: false, error: null },
}: {
  userId: string;
  name?: string | null;
  vehicles?: readonly VehicleIdentity[];
  entitlements?: DrivingEntitlementState;
}) {
  const [trip, setTrip] = useState<AdminUserTripDto | null>(null);
  const openTripById = useCallback((tripId: string) => {
    setTrip(tripStub(tripId));
  }, []);
  return (
    <AlStack gap="md">
      <DrivingOverview
        userId={userId}
        name={name}
        vehicles={vehicles}
        entitlements={entitlements}
      />
      <div data-testid="user-driving-tab" className="dq-tab">
        <UserDriveQuantPanel userId={userId} vehicles={vehicles} onOpenTrip={setTrip} />
      </div>
      <UserCrashesPanel userId={userId} vehicles={vehicles} onOpenTrip={openTripById} />
      <UserTripDetailSheet
        userId={userId}
        trip={trip}
        vehicles={vehicles}
        onClose={() => {
          setTrip(null);
        }}
      />
    </AlStack>
  );
}
