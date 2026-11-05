import { ApiError, type AdminOwnershipClaimDto } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import {
  approveBlocker,
  conflictingPlateClaims,
  decisionRemarksError,
  ownershipReviewErrorView,
  transferOutcome,
} from './ownership-claim-context';

function claim(partial: Partial<AdminOwnershipClaimDto>): AdminOwnershipClaimDto {
  return {
    id: 'claim-1',
    vehicleId: 'veh-1',
    claimantAccountId: 'acct-a',
    status: 'SUBMITTED',
    rcMediaAssetId: 'media-1',
    planSubscriptionId: null,
    notes: null,
    rejectionReason: null,
    reviewedByAdminId: null,
    reviewedAt: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    registration: 'KA01AB1234',
    plateConflict: { otherRows: 0, verifiedElsewhere: false },
    ...partial,
  };
}

describe('decisionRemarksError', () => {
  it('requires remarks for every decision and bounds them at 2000', () => {
    expect(decisionRemarksError('   ')).toMatch(/required/);
    expect(decisionRemarksError('x'.repeat(2001))).toMatch(/2000/);
    expect(decisionRemarksError('RC name matches the claimant')).toBeNull();
  });
});

describe('approveBlocker', () => {
  it('blocks until the RC has been viewed', () => {
    expect(
      approveBlocker({ claim: claim({}), rcViewed: false, verifiedOwnerOnOtherRow: false }),
    ).toEqual({ reason: 'Open and view the RC before approving.' });
    expect(
      approveBlocker({ claim: claim({}), rcViewed: true, verifiedOwnerOnOtherRow: false }),
    ).toBeNull();
  });

  it('blocks when another row of the plate has a verified owner (server flag or plate search)', () => {
    const flagged = claim({ plateConflict: { otherRows: 1, verifiedElsewhere: true } });
    expect(
      approveBlocker({ claim: flagged, rcViewed: true, verifiedOwnerOnOtherRow: false })?.reason,
    ).toMatch(/duplicate plate/);
    expect(
      approveBlocker({ claim: claim({}), rcViewed: true, verifiedOwnerOnOtherRow: true })?.reason,
    ).toMatch(/duplicate plate/);
  });

  it('blocks decided claims', () => {
    expect(
      approveBlocker({
        claim: claim({ status: 'REJECTED' }),
        rcViewed: true,
        verifiedOwnerOnOtherRow: false,
      })?.reason,
    ).toMatch(/already decided/);
  });
});

describe('conflictingPlateClaims', () => {
  it('lists other claimants on the same plate (any row) and the same vehicle, newest first', () => {
    const current = claim({});
    const rows = [
      current,
      claim({
        id: 'same-claimant',
        claimantAccountId: 'acct-a',
        createdAt: '2026-10-01T00:00:00Z',
      }),
      claim({
        id: 'other-row',
        vehicleId: 'veh-2',
        claimantAccountId: 'acct-b',
        registration: 'ka 01 ab 1234',
        createdAt: '2026-10-02T00:00:00Z',
      }),
      claim({
        id: 'same-vehicle',
        claimantAccountId: 'acct-c',
        registration: null,
        createdAt: '2026-10-03T00:00:00Z',
      }),
      claim({
        id: 'unrelated',
        vehicleId: 'veh-9',
        claimantAccountId: 'acct-d',
        registration: 'MH12',
      }),
    ];
    expect(conflictingPlateClaims(rows, current, null).map((row) => row.id)).toEqual([
      'same-vehicle',
      'other-row',
    ]);
  });
});

describe('transferOutcome', () => {
  it('reads the CLAIM_APPROVED history row for this claim', () => {
    const outcome = transferOutcome(
      [
        {
          id: 'h1',
          vehicleId: 'veh-1',
          fromAccountId: 'acct-old',
          toAccountId: 'acct-a',
          reason: 'CLAIM_APPROVED',
          claimId: 'claim-1',
          decidedByAdminId: 'admin-1',
          remarks: 'RC matches',
          removedDriverCount: 2,
          createdAt: '2026-11-05T10:00:00Z',
        },
      ],
      'claim-1',
    );
    expect(outcome).toEqual({
      previousOwnerId: 'acct-old',
      suspendedDrivers: 2,
      decidedAt: '2026-11-05T10:00:00Z',
      remarks: 'RC matches',
    });
    expect(transferOutcome([], 'claim-1')).toBeNull();
  });
});

describe('ownershipReviewErrorView', () => {
  it('maps the ownership review error codes', () => {
    expect(
      ownershipReviewErrorView(new ApiError('x', 403, 'ownership_reviewer_required')).message,
    ).toMatch(/not an authorized ownership reviewer/);
    const elsewhere = ownershipReviewErrorView(new ApiError('x', 409, 'plate_verified_elsewhere'));
    expect(elsewhere.stale).toBe(true);
    expect(elsewhere.message).toMatch(/duplicate plate/);
    expect(ownershipReviewErrorView(new ApiError('x', 409, 'plan_required')).message).toMatch(
      /no longer holds a live plan/,
    );
    expect(
      ownershipReviewErrorView(new ApiError('x', 409, 'ownership_claim_invalid_transition')).stale,
    ).toBe(true);
  });

  it('flags step-up so the reviewer can verify again', () => {
    const view = ownershipReviewErrorView(
      new ApiError('Step-up required', 403, 'step_up_required'),
    );
    expect(view.stepUp).toBe(true);
  });
});
