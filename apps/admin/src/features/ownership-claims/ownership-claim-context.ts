import {
  ApiError,
  isStepUpRequiredError,
  type AdminOwnershipClaimDto,
  type AdminVehicleDriversDto,
  type OwnershipClaimDto,
  type OwnershipClaimPrecheck,
  type OwnershipClaimPrecheckField,
  type OwnershipTransferSummary,
  type VehicleOwnershipHistoryDto,
  type VehicleOwnershipHistoryReason,
} from '@autolokate/api-client';

import { mapAdminApiError } from '@/platform/errors/admin-api-errors';

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

/** Remarks bound shared with the server DTO (`MaxLength(2000)`). */
export const OWNERSHIP_REMARKS_MAX = 2000;

/** Null when the remarks are acceptable for an approve / reject (both mandatory). */
export function decisionRemarksError(remarks: string): string | null {
  const trimmed = remarks.trim();
  if (!trimmed) return 'Remarks are required for every decision.';
  if (trimmed.length > OWNERSHIP_REMARKS_MAX) {
    return `Remarks must be at most ${String(OWNERSHIP_REMARKS_MAX)} characters.`;
  }
  return null;
}

export function isOpenClaim(claim: Pick<OwnershipClaimDto, 'status'>): boolean {
  return claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW';
}

/** Compact plate key for comparisons only (case and separators ignored). */
export function compactPlate(value: string | null | undefined): string | null {
  const compact = value?.replace(/[^a-z0-9]/gi, '').toUpperCase() ?? '';
  return compact.length > 0 ? compact : null;
}

/**
 * Other claims for the same plate (any vehicle row of it), newest first — from the loaded window.
 * Matched on the compact registration the queue row carries; same-vehicle claims count too.
 */
export function conflictingPlateClaims(
  claims: readonly AdminOwnershipClaimDto[],
  current: AdminOwnershipClaimDto,
  plate: string | null,
): AdminOwnershipClaimDto[] {
  const key = compactPlate(current.registration ?? plate);
  return claims
    .filter((row) => row.id !== current.id && row.claimantAccountId !== current.claimantAccountId)
    .filter(
      (row) =>
        row.vehicleId === current.vehicleId ||
        (key !== null && compactPlate(row.registration) === key),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const PRECHECK_COPY: Record<
  OwnershipClaimPrecheck,
  { label: string; tone: AdminStatusChipTone }
> = {
  MATCHED: { label: 'Registry: matched', tone: 'active' },
  MISMATCHED: { label: 'Registry: mismatch', tone: 'draft' },
  MANUAL_REVIEW: { label: 'Registry: manual review', tone: 'neutral' },
};

export const PRECHECK_FIELD_COPY: Record<
  OwnershipClaimPrecheckField,
  { label: string; tone: AdminStatusChipTone }
> = {
  MATCH: { label: 'Match', tone: 'active' },
  MISMATCH: { label: 'Mismatch', tone: 'draft' },
  UNAVAILABLE: { label: 'Not checked', tone: 'none' },
};

export const HISTORY_REASON_LABEL: Record<VehicleOwnershipHistoryReason, string> = {
  CLAIM_APPROVED: 'Claim approved — ownership transferred',
  PROVISIONAL_EXPIRED: 'Provisional ownership expired (no plan in 30 days)',
  ACCOUNT_ERASED: 'Owner account erased — vehicle released',
};

export type ApproveBlocker = { reason: string } | null;

/**
 * Why Approve is unavailable, if it is. The server re-checks everything; this only keeps the
 * reviewer from sending a request it will refuse, and forces the RC to be viewed first.
 */
export function approveBlocker(input: {
  claim: AdminOwnershipClaimDto;
  rcViewed: boolean;
  verifiedOwnerOnOtherRow: boolean;
}): ApproveBlocker {
  if (!isOpenClaim(input.claim)) return { reason: 'This claim is already decided.' };
  if (input.claim.plateConflict?.verifiedElsewhere || input.verifiedOwnerOnOtherRow) {
    return {
      reason:
        'Another vehicle row for this plate already has an RC-verified owner. Resolve the duplicate plate first.',
    };
  }
  if (!input.rcViewed) return { reason: 'Open and view the RC before approving.' };
  return null;
}

/**
 * What the server did on approval. Counts come from the review response's `transferSummary` when
 * the API sends it; otherwise from the matching ownership-history row (drivers only). `null` count =
 * not reported.
 */
export type TransferOutcome = {
  previousOwnerId: string | null;
  previousOwnerRemoved: number | null;
  suspendedDrivers: number | null;
  invitesCancelled: number | null;
  taxiAssignmentsEnded: number | null;
  otherClaimsAutoRejected: number | null;
  decidedAt: string | null;
  remarks: string | null;
};

function count(value: unknown): number | null {
  if (typeof value === 'boolean') return value ? 1 : 0;
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null;
}

/** Normalizes `transferSummary`; null when absent or carrying no usable count. */
export function readTransferSummary(
  summary: OwnershipTransferSummary | null | undefined,
): Pick<
  TransferOutcome,
  | 'previousOwnerRemoved'
  | 'suspendedDrivers'
  | 'invitesCancelled'
  | 'taxiAssignmentsEnded'
  | 'otherClaimsAutoRejected'
> | null {
  if (!summary || typeof summary !== 'object') return null;
  const read = {
    previousOwnerRemoved: count(summary.previousOwnerRemoved),
    suspendedDrivers: count(summary.driversSuspended),
    invitesCancelled: count(summary.invitesCancelled),
    taxiAssignmentsEnded: count(summary.taxiAssignmentsEnded),
    otherClaimsAutoRejected: count(summary.otherClaimsAutoRejected),
  };
  return Object.values(read).some((value) => value !== null) ? read : null;
}

export function transferOutcome(
  history: readonly VehicleOwnershipHistoryDto[],
  claimId: string,
  summary?: OwnershipTransferSummary | null,
): TransferOutcome | null {
  const row = history.find((item) => item.claimId === claimId && item.reason === 'CLAIM_APPROVED');
  const fromSummary = readTransferSummary(summary);
  if (!row && !fromSummary) return null;
  return {
    previousOwnerId: row?.fromAccountId ?? null,
    previousOwnerRemoved: fromSummary?.previousOwnerRemoved ?? null,
    suspendedDrivers: fromSummary?.suspendedDrivers ?? row?.removedDriverCount ?? null,
    invitesCancelled: fromSummary?.invitesCancelled ?? null,
    taxiAssignmentsEnded: fromSummary?.taxiAssignmentsEnded ?? null,
    otherClaimsAutoRejected: fromSummary?.otherClaimsAutoRejected ?? null,
    decidedAt: row?.createdAt ?? null,
    remarks: row?.remarks ?? null,
  };
}

export type OwnershipReviewErrorView = {
  message: string;
  /** 403 step_up — the operator must verify again before deciding. */
  stepUp: boolean;
  /** The claim or plate changed under us — refresh before retrying. */
  stale: boolean;
};

/** Reviewer-facing text for a failed review call. Never echoes remarks or PII. */
export function ownershipReviewErrorView(error: unknown): OwnershipReviewErrorView {
  if (isStepUpRequiredError(error)) {
    return {
      message: 'Your admin verification expired. Verify again, then repeat the decision.',
      stepUp: true,
      stale: false,
    };
  }
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'ownership_reviewer_required':
        return {
          message:
            'You’re not an authorized ownership reviewer. Ask an authorized reviewer to decide.',
          stepUp: false,
          stale: false,
        };
      case 'plate_verified_elsewhere':
        return {
          message:
            'Another vehicle row for this plate already has an RC-verified owner. Resolve the duplicate plate first.',
          stepUp: false,
          stale: true,
        };
      case 'plan_required':
        return {
          message: 'The claimant no longer holds a live plan, so the claim cannot be approved.',
          stepUp: false,
          stale: true,
        };
      case 'ownership_claim_invalid_transition':
        return {
          message:
            'This claim was already decided (possibly by another reviewer). The list was refreshed.',
          stepUp: false,
          stale: true,
        };
      default:
        break;
    }
    if (error.status === 404) {
      return { message: 'This claim no longer exists.', stepUp: false, stale: true };
    }
  }
  const mapped = mapAdminApiError(error);
  const message =
    mapped.code === 'validation' && mapped.message.trim() ? mapped.message : mapped.userMessage;
  return { message, stepUp: false, stale: false };
}
