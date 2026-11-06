import type { AdminUserTripDto } from '@autolokate/api-client';
import { AlStack } from '@autolokate/ui';
import { useCallback, useState } from 'react';

import { UserCrashesPanel } from '@/features/drivequant/UserCrashesPanel';
import { UserTripDetailSheet } from '@/features/drivequant/UserTripDetailSheet';
import { UserDriveQuantPanel } from '@/features/users/UserDriveQuantPanel';

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

/** User detail → Driving: trips + driver score, trip drawer, crashes. Every read is audited. */
export function UserDrivingTab({ userId }: { userId: string }) {
  const [trip, setTrip] = useState<AdminUserTripDto | null>(null);
  const openTripById = useCallback((tripId: string) => {
    setTrip(tripStub(tripId));
  }, []);
  return (
    <AlStack gap="md">
      <div data-testid="user-driving-tab" className="dq-tab">
        <UserDriveQuantPanel userId={userId} onOpenTrip={setTrip} />
      </div>
      <UserCrashesPanel userId={userId} onOpenTrip={openTripById} />
      <UserTripDetailSheet
        userId={userId}
        trip={trip}
        onClose={() => {
          setTrip(null);
        }}
      />
    </AlStack>
  );
}
