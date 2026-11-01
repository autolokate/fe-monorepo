import type { AdminTaxiBookingSummaryDto } from '@autolokate/api-client';
import { describe, expect, it } from 'vitest';

import {
  bodyFromForm,
  formFromPolicy,
  validateTaxiPolicyForm,
} from '@/features/taxi/taxi-policy-form';
import {
  bookingCancelBlockedReason,
  customerAdvanceOf,
  depositReleaseBlockedReason,
  describeMoneyOutcome,
  taxiBookingStatusLabel,
} from '@/features/taxi/taxi-ops-format';

const POLICY = {
  customerAdvanceBps: 500,
  partnerDepositBps: 700,
  customerAdvanceRefundWindowHours: 24,
  partnerDepositDueMinutes: 120,
  tripDisputeWindowHours: 24,
};

describe('taxi policy form (v2 fields)', () => {
  it('round-trips the three new windows into the PUT body', () => {
    const body = bodyFromForm(formFromPolicy(POLICY));
    expect(body).toMatchObject(POLICY);
  });

  it('enforces the server ranges, allows 0 bps and blank windows', () => {
    const form = {
      ...formFromPolicy(POLICY),
      customerAdvanceBps: '0',
      customerAdvanceRefundWindowHours: '721',
      partnerDepositDueMinutes: '0',
      tripDisputeWindowHours: '',
    };
    const errors = validateTaxiPolicyForm(form);
    expect(errors.customerAdvanceBps).toBeUndefined();
    expect(errors.customerAdvanceRefundWindowHours).toMatch(/0 and 720/);
    expect(errors.partnerDepositDueMinutes).toMatch(/1 and 10080/);
    expect(errors.tripDisputeWindowHours).toBeUndefined();
  });

  it('omits a blank window so the server applies its own default', () => {
    const body = bodyFromForm({ ...formFromPolicy(POLICY), tripDisputeWindowHours: '' });
    expect('tripDisputeWindowHours' in body).toBe(false);
    expect(body.partnerDepositDueMinutes).toBe(120);
  });
});

function booking(overrides: Partial<AdminTaxiBookingSummaryDto>): AdminTaxiBookingSummaryDto {
  return {
    id: 'b1',
    requestId: 'r1',
    bidId: 'bid',
    orgId: 'o1',
    accountId: 'a1',
    vehicleId: 'v1',
    driverAccountId: null,
    status: 'COMPLETED',
    selectedFareRupees: 1000,
    currency: 'INR',
    customerAdvanceStatus: 'HELD',
    partnerDepositStatus: 'HELD',
    contactUnlocked: true,
    pickupLabel: null,
    dropoffLabel: null,
    pickupAt: null,
    selectedAt: '2026-11-01T00:00:00.000Z',
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
    cancelledBy: null,
    cancelReason: null,
    depositReleaseDueAt: null,
    depositReleasedAt: null,
    depositReleasedByAdminId: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('taxi ops format (v2)', () => {
  it('uses the server advance block (amount + bps) without computing anything', () => {
    const side = customerAdvanceOf(
      booking({
        advance: {
          status: 'HELD',
          amountPaise: 5000,
          bps: 500,
          refundableUntil: null,
          refundable: false,
        },
      }),
    );
    expect(side).toEqual({ status: 'HELD', amountPaise: 5000, bps: 500 });
  });

  it('allows admin cancel in PENDING_PARTNER_DEPOSIT and DISPUTED, not after completion', () => {
    expect(bookingCancelBlockedReason('PENDING_PARTNER_DEPOSIT')).toBeNull();
    expect(bookingCancelBlockedReason('DISPUTED')).toBeNull();
    expect(bookingCancelBlockedReason('COMPLETED')).not.toBeNull();
  });

  it('deposit return only for a held deposit on a completed trip', () => {
    expect(depositReleaseBlockedReason(booking({}))).toBeNull();
    expect(depositReleaseBlockedReason(booking({ status: 'CONFIRMED' }))).not.toBeNull();
    expect(
      depositReleaseBlockedReason(booking({ partnerDepositStatus: 'RELEASED' })),
    ).not.toBeNull();
  });

  it('renders unknown statuses safely and describes outcomes from server amounts', () => {
    expect(taxiBookingStatusLabel('SOMETHING_NEW')).toBe('Something New');
    expect(
      describeMoneyOutcome({
        advance: { decision: 'REFUND', amountPaise: 5000 },
        deposit: { decision: 'NONE', amountPaise: 0 },
      }),
    ).toEqual([
      'Booking fee: ₹50 refunded to the customer.',
      'Partner deposit: no money held — unchanged.',
    ]);
  });
});
