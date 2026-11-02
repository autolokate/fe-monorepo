import { describe, expect, it } from 'vitest';

import { toVehicleRosterRows } from '@/features/users/vehicle-roster-rows';

describe('toVehicleRosterRows', () => {
  it('lists the owner first, then every driver membership in server order', () => {
    const rows = toVehicleRosterRows({
      vehicleId: 'v1',
      plate: 'MH12AB1234',
      owner: {
        accountId: 'owner-1',
        username: 'owner',
        role: 'PROVISIONAL_OWNER',
        ownershipVerified: false,
        ownershipVerifiedAt: null,
      },
      drivers: [
        {
          id: 'm2',
          accountId: 'driver-2',
          username: null,
          status: 'PENDING',
          resolvedAt: null,
          createdAt: '2026-11-01T00:00:00.000Z',
          updatedAt: '2026-11-01T00:00:00.000Z',
        },
        {
          id: 'm1',
          accountId: 'driver-1',
          username: 'driver',
          status: 'REMOVED',
          resolvedAt: '2026-10-05T00:00:00.000Z',
          createdAt: '2026-10-01T00:00:00.000Z',
          updatedAt: '2026-10-05T00:00:00.000Z',
        },
      ],
    });
    expect(rows.map((row) => [row.accountId, row.role, row.status])).toEqual([
      ['owner-1', 'Provisional owner', 'RC not verified'],
      ['driver-2', 'Driver', 'Pending'],
      ['driver-1', 'Driver', 'Removed'],
    ]);
    expect(rows[0]?.since).toBeNull();
    expect(rows[2]?.resolvedAt).toBe('2026-10-05T00:00:00.000Z');
  });

  it('has no owner row while nobody has paid for or claimed the vehicle', () => {
    expect(toVehicleRosterRows({ vehicleId: 'v', plate: 'X', owner: null, drivers: [] })).toEqual(
      [],
    );
    expect(toVehicleRosterRows(null)).toEqual([]);
  });
});
