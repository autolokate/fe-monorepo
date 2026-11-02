import type { AdminVehicleDriversDto, OwnershipClaimDto } from '@autolokate/api-client';

import type { AdminStatusChipTone } from '@/platform/components/AdminWowSurface';

/**
 * The claimant's CURRENT role on the claimed vehicle, read from the admin vehicle roster
 * (`GET /admin/v1/vehicles/{vehicleId}/drivers`). Flow v3: a paid account that adds a vehicle is
 * its PROVISIONAL_OWNER until its own RC is approved; an unpaid creator / invited person is a DRIVER.
 * The claim DTO itself carries no role, so this is derived — and after approval it reads OWNER.
 */
export type ClaimantRoleKind =
  | 'PROVISIONAL_OWNER'
  | 'OWNER'
  | 'DRIVER'
  | 'DRIVER_PENDING'
  | 'NOT_LINKED';

export type ClaimantRole = {
  kind: ClaimantRoleKind;
  label: string;
  description: string;
  tone: AdminStatusChipTone;
};

const ROLE_COPY: Record<ClaimantRoleKind, Omit<ClaimantRole, 'kind'>> = {
  PROVISIONAL_OWNER: {
    label: 'Provisional owner',
    description:
      'Paid account that added this vehicle. Approving the RC makes it the verified owner.',
    tone: 'draft',
  },
  OWNER: {
    label: 'Verified owner',
    description: 'Already the RC-verified owner of this vehicle.',
    tone: 'active',
  },
  DRIVER: {
    label: 'Driver',
    description:
      'Active driver on this vehicle (not the owner). Approving transfers ownership to the claimant.',
    tone: 'neutral',
  },
  DRIVER_PENDING: {
    label: 'Driver (invite pending)',
    description: 'Driver membership not yet accepted.',
    tone: 'neutral',
  },
  NOT_LINKED: {
    label: 'Not linked',
    description: 'The claimant is neither owner nor driver of this vehicle right now.',
    tone: 'none',
  },
};

export function deriveClaimantRole(
  roster: AdminVehicleDriversDto | null,
  claimantAccountId: string,
): ClaimantRole | null {
  if (!roster) return null;
  let kind: ClaimantRoleKind = 'NOT_LINKED';
  if (roster.owner?.accountId === claimantAccountId) {
    kind = roster.owner.role === 'OWNER' ? 'OWNER' : 'PROVISIONAL_OWNER';
  } else {
    const memberships = roster.drivers.filter((row) => row.accountId === claimantAccountId);
    if (memberships.some((row) => row.status === 'ACTIVE')) kind = 'DRIVER';
    else if (memberships.some((row) => row.status === 'PENDING')) kind = 'DRIVER_PENDING';
  }
  return { kind, ...ROLE_COPY[kind] };
}

/** Owner username / short id other than the claimant — shown so reviewers see who loses ownership. */
export function currentOwnerLabel(
  roster: AdminVehicleDriversDto | null,
  claimantAccountId: string,
): string | null {
  const owner = roster?.owner;
  if (!owner || owner.accountId === claimantAccountId) return null;
  return owner.username ?? owner.accountId;
}

export type ClaimAttempt = {
  claim: OwnershipClaimDto;
  attempt: number;
  isCurrent: boolean;
};

/**
 * Every RC claim the same claimant filed for the same vehicle, oldest first (attempt 1 = first
 * submission; later ones are resubmissions after a rejection/withdrawal). Built from the admin
 * claim list — the API has no dedicated history endpoint.
 */
export function claimAttempts(
  claims: readonly OwnershipClaimDto[],
  current: OwnershipClaimDto,
): ClaimAttempt[] {
  const related = claims.filter(
    (row) =>
      row.vehicleId === current.vehicleId && row.claimantAccountId === current.claimantAccountId,
  );
  if (!related.some((row) => row.id === current.id)) related.push(current);
  return related
    .slice()
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))
    .map((claim, index) => ({ claim, attempt: index + 1, isCurrent: claim.id === current.id }));
}

export function claimStatusTone(status: OwnershipClaimDto['status']): AdminStatusChipTone {
  if (status === 'APPROVED') return 'active';
  if (status === 'REJECTED' || status === 'WITHDRAWN') return 'none';
  if (status === 'UNDER_REVIEW') return 'draft';
  return 'neutral';
}
