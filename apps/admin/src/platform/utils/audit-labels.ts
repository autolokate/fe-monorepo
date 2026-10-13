import type { AuditAction, AuditEventDto } from '@autolokate/api-client';

import { formatAuditField } from '@/platform/utils/audit-field';

/** Human-readable copy for every OpenAPI `AuditAction` (the union is open, so keyed by string). */
export const AUDIT_ACTION_LABELS: Readonly<Record<string, string>> = {
  PAYOUT_ISSUED: 'Payout issued',
  TRANSFER_APPROVED: 'Transfer approved',
  REFUND_OR_CLAWBACK: 'Refund or clawback',
  QR_CODE_DEACTIVATED: 'QR code deactivated',
  BATCH_PROVISIONED: 'Batch provisioned',
  RCRECORD_ACCESS: 'RC record access',
  OWNER_NAME_ACCESS: 'Owner name access',
  PARK_PII_ACCESS: 'Park PII access',
  EMERGENCY_MEDIA_ACCESS: 'Emergency media access',
  INCIDENT_PII_ACCESS: 'Incident PII access',
  CORPORATE_PII_ACCESS: 'Corporate PII access',
  SETTLEMENT_DISCREPANCY: 'Settlement discrepancy',
  INCIDENT_STALLED: 'Incident stalled',
  CHARGEBACK_AFTER_CLAIM: 'Chargeback after claim',
  ENTITLEMENT_DORMANT: 'Entitlement dormant',
  BATCH_CODES_GENERATED: 'Batch codes generated',
  PRINTRUN_SUBMITTED: 'Print run submitted',
  QA_APPROVED: 'QA approved',
  QA_REJECTED: 'QA rejected',
  BATCH_ALLOCATED: 'Batch allocated',
  BATCH_SCRAPPED: 'Batch scrapped',
  BULK_ORDER_CONFIRMED: 'Bulk order confirmed',
  INVOICE_ISSUED: 'Invoice issued',
  INVOICE_PAID: 'Invoice paid',
  CREDIT_NOTE_ISSUED: 'Credit note issued',
  ENTITLEMENTS_MINTED: 'Entitlements minted',
  ENTITLEMENT_SUSPENDED: 'Entitlement suspended',
  ENTITLEMENT_REVOKED: 'Entitlement revoked',
  ACCOUNT_ERASURE: 'Account erasure',
  CONSENT_WITHDRAWAL: 'Consent withdrawal',
  AUDIT_EXPORTED: 'Audit log exported',
  PARTNER_ENROLLED: 'Partner enrolled',
};

/** `SOME_CODE` / `some_table` → `Some code` — fallback for values the backend adds later. */
export function humanizeCode(value: string): string {
  const words = value.replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : value;
}

export function auditActionLabel(action: AuditAction): string {
  return AUDIT_ACTION_LABELS[action] ?? humanizeCode(action);
}

const TARGET_TYPE_LABELS: Record<string, string> = {
  audit_events: 'Audit log',
  qr_batches: 'QR batch',
  qr_codes: 'QR code',
  orders: 'Order',
  payments: 'Payment',
  subscriptions: 'Coverage',
  promos: 'Promo',
  plans: 'Plan',
  skus: 'SKU',
  incidents: 'Incident',
  ownership_transfers: 'Ownership transfer',
  accounts: 'Account',
};

export function auditTargetLabel(targetType: object | null): string | null {
  const raw = formatAuditField(targetType);
  if (raw === '—') {
    return null;
  }
  return TARGET_TYPE_LABELS[raw.toLowerCase()] ?? humanizeCode(raw);
}

export function auditActorLabel(event: AuditEventDto): string {
  if (event.actorAdminId) {
    return 'an admin';
  }
  if (event.actorAccountId) {
    return 'a customer account';
  }
  return 'the system';
}

/** One-line sentence for feeds: "Audit log exported by an admin". */
export function describeAuditEvent(event: AuditEventDto): string {
  return `${auditActionLabel(event.action)} by ${auditActorLabel(event)}`;
}
