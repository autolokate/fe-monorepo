import type { AdminVehicleDriversDto, OwnershipClaimDto } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import { claimAttempts, currentOwnerLabel, deriveClaimantRole } from './ownership-claim-context';

const CLAIMANT = 'acct-claimant';

function roster(partial: Partial<AdminVehicleDriversDto>): AdminVehicleDriversDto {
  return { vehicleId: 'veh-1', plate: 'KA01AB1234', owner: null, drivers: [], ...partial };
}

function claim(partial: Partial<OwnershipClaimDto>): OwnershipClaimDto {
  return {
    id: 'claim-1',
    vehicleId: 'veh-1',
    claimantAccountId: CLAIMANT,
    status: 'SUBMITTED',
    rcMediaAssetId: 'media-1',
    planSubscriptionId: null,
    notes: null,
    rejectionReason: null,
    reviewedByAdminId: null,
    reviewedAt: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    ...partial,
  };
}

describe('deriveClaimantRole', () => {
  it('returns null while the roster is unknown', () => {
    expect(deriveClaimantRole(null, CLAIMANT)).toBeNull();
  });

  it('labels a provisional owner (paid account that added the vehicle)', () => {
    const role = deriveClaimantRole(
      roster({
        owner: {
          accountId: CLAIMANT,
          username: 'claimant',
          role: 'PROVISIONAL_OWNER',
          ownershipVerified: false,
          ownershipVerifiedAt: null,
        },
      }),
      CLAIMANT,
    );
    expect(role?.kind).toBe('PROVISIONAL_OWNER');
    expect(role?.label).toBe('Provisional owner');
  });

  it('labels a verified owner', () => {
    const role = deriveClaimantRole(
      roster({
        owner: {
          accountId: CLAIMANT,
          username: null,
          role: 'OWNER',
          ownershipVerified: true,
          ownershipVerifiedAt: '2026-11-01T00:00:00.000Z',
        },
      }),
      CLAIMANT,
    );
    expect(role?.kind).toBe('OWNER');
  });

  it('labels an active or pending driver', () => {
    const driver = {
      id: 'm1',
      accountId: CLAIMANT,
      username: null,
      resolvedAt: null,
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    };
    expect(
      deriveClaimantRole(roster({ drivers: [{ ...driver, status: 'ACTIVE' }] }), CLAIMANT)?.kind,
    ).toBe('DRIVER');
    expect(
      deriveClaimantRole(roster({ drivers: [{ ...driver, status: 'PENDING' }] }), CLAIMANT)?.kind,
    ).toBe('DRIVER_PENDING');
    expect(
      deriveClaimantRole(roster({ drivers: [{ ...driver, status: 'REMOVED' }] }), CLAIMANT)?.kind,
    ).toBe('NOT_LINKED');
  });
});

describe('currentOwnerLabel', () => {
  it('shows another owner only', () => {
    const owner = {
      accountId: 'someone-else',
      username: 'other_owner',
      role: 'OWNER' as const,
      ownershipVerified: true,
      ownershipVerifiedAt: null,
    };
    expect(currentOwnerLabel(roster({ owner }), CLAIMANT)).toBe('other_owner');
    expect(currentOwnerLabel(roster({ owner: { ...owner, accountId: CLAIMANT } }), CLAIMANT)).toBe(
      null,
    );
  });
});

describe('claimAttempts', () => {
  it('orders same claimant + vehicle claims oldest first and marks the current one', () => {
    const first = claim({
      id: 'c1',
      status: 'REJECTED',
      rejectionReason: 'Blurry RC',
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    const second = claim({ id: 'c2', createdAt: '2026-10-05T00:00:00.000Z' });
    const otherVehicle = claim({ id: 'c3', vehicleId: 'veh-2' });
    const otherClaimant = claim({ id: 'c4', claimantAccountId: 'acct-other' });
    const attempts = claimAttempts([second, otherVehicle, first, otherClaimant], second);
    expect(attempts.map((row) => [row.claim.id, row.attempt, row.isCurrent])).toEqual([
      ['c1', 1, false],
      ['c2', 2, true],
    ]);
  });

  it('includes the current claim even when the list does not', () => {
    const current = claim({ id: 'solo' });
    expect(claimAttempts([], current)).toEqual([{ claim: current, attempt: 1, isCurrent: true }]);
  });
});
