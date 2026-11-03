import { describe, expect, it } from 'vitest';

import { AUDIT_ACTION_OPTIONS, auditActionLabel, resolveActionFilter } from './audit-filters';

/** The backend `GET /admin/v1/audit-events` `action` enum (apps/api/openapi.json). */
const BACKEND_AUDIT_ACTIONS = [
  'PAYOUT_ISSUED',
  'TRANSFER_APPROVED',
  'REFUND_OR_CLAWBACK',
  'QR_CODE_DEACTIVATED',
  'BATCH_PROVISIONED',
  'RCRECORD_ACCESS',
  'OWNER_NAME_ACCESS',
  'PARK_PII_ACCESS',
  'EMERGENCY_MEDIA_ACCESS',
  'INCIDENT_PII_ACCESS',
  'CORPORATE_PII_ACCESS',
  'SETTLEMENT_DISCREPANCY',
  'INCIDENT_STALLED',
  'CHARGEBACK_AFTER_CLAIM',
  'ENTITLEMENT_DORMANT',
  'BATCH_CODES_GENERATED',
  'PRINTRUN_SUBMITTED',
  'QA_APPROVED',
  'QA_REJECTED',
  'BATCH_ALLOCATED',
  'BATCH_SCRAPPED',
  'BULK_ORDER_CONFIRMED',
  'INVOICE_ISSUED',
  'INVOICE_PAID',
  'CREDIT_NOTE_ISSUED',
  'ENTITLEMENTS_MINTED',
  'ENTITLEMENT_SUSPENDED',
  'ENTITLEMENT_REVOKED',
  'ACCOUNT_ERASURE',
  'CONSENT_WITHDRAWAL',
  'AUDIT_EXPORTED',
  'PARTNER_ENROLLED',
  'DISCOVERY_REEL_MUTATION',
  'DISCOVERY_QA_MODERATION',
  'OWNERSHIP_CLAIM_APPROVED',
  'OWNERSHIP_CLAIM_REJECTED',
  'OWNERSHIP_CLAIM_UNDER_REVIEW',
  'TAXI_POLICY_PUBLISHED',
  'TAXI_BOOKING_ADMIN_CANCELLED',
  'TAXI_DEPOSIT_RELEASED',
  'TAXI_ENROLLMENT_SUSPENDED',
  'TAXI_ENROLLMENT_REINSTATED',
  'USER_ROLE_GRANTED',
  'USER_ROLE_REVOKED',
  'SUPPORT_TICKET_UPDATED',
  'BATCH_CODES_EXPORTED',
  'WEBSITE_BOOKING_SLOTS_PUBLISHED',
  'WEBSITE_BOOKING_STATUS_CHANGED',
  'TAXI_DISPUTE_RESOLVED',
];

describe('audit action filter', () => {
  it('offers every backend audit action (none silently dropped from the query)', () => {
    const offered = new Set(AUDIT_ACTION_OPTIONS.map((option) => option.value));
    expect(BACKEND_AUDIT_ACTIONS.filter((action) => !offered.has(action))).toEqual([]);
    for (const action of BACKEND_AUDIT_ACTIONS) {
      expect(resolveActionFilter(action)).toBe(action);
    }
  });

  it('resolves by label and ignores unknown text', () => {
    expect(resolveActionFilter('user role granted')).toBe('USER_ROLE_GRANTED');
    expect(resolveActionFilter('NOT_A_REAL_ACTION')).toBeUndefined();
  });
});

describe('auditActionLabel', () => {
  it('uses the curated label and falls back for actions it does not list', () => {
    expect(auditActionLabel('RCRECORD_ACCESS', () => 'x')).toBe('RC record access');
    expect(auditActionLabel('SOMETHING_NEW', (v) => v.toLowerCase())).toBe('something_new');
  });
});
