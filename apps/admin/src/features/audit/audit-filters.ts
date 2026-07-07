import type { AuditAction } from '@autolokate/api-client';

/** OpenAPI `GET /admin/v1/audit-events` `action` query enum. */
export const AUDIT_ACTION_OPTIONS: { value: AuditAction; label: string }[] = [
  { value: 'PAYOUT_ISSUED', label: 'Payout issued' },
  { value: 'TRANSFER_APPROVED', label: 'Transfer approved' },
  { value: 'REFUND_OR_CLAWBACK', label: 'Refund or clawback' },
  { value: 'QR_CODE_DEACTIVATED', label: 'QR code deactivated' },
  { value: 'BATCH_PROVISIONED', label: 'Batch provisioned' },
  { value: 'RCRECORD_ACCESS', label: 'RC record access' },
  { value: 'OWNER_NAME_ACCESS', label: 'Owner name access' },
  { value: 'PARK_PII_ACCESS', label: 'Park PII access' },
  { value: 'EMERGENCY_MEDIA_ACCESS', label: 'Emergency media access' },
  { value: 'INCIDENT_PII_ACCESS', label: 'Incident PII access' },
  { value: 'CORPORATE_PII_ACCESS', label: 'Corporate PII access' },
  { value: 'SETTLEMENT_DISCREPANCY', label: 'Settlement discrepancy' },
  { value: 'INCIDENT_STALLED', label: 'Incident stalled' },
  { value: 'CHARGEBACK_AFTER_CLAIM', label: 'Chargeback after claim' },
  { value: 'ENTITLEMENT_DORMANT', label: 'Entitlement dormant' },
  { value: 'BATCH_CODES_GENERATED', label: 'Batch codes generated' },
  { value: 'PRINTRUN_SUBMITTED', label: 'Print run submitted' },
  { value: 'QA_APPROVED', label: 'QA approved' },
  { value: 'QA_REJECTED', label: 'QA rejected' },
  { value: 'BATCH_ALLOCATED', label: 'Batch allocated' },
  { value: 'BATCH_SCRAPPED', label: 'Batch scrapped' },
  { value: 'BULK_ORDER_CONFIRMED', label: 'Bulk order confirmed' },
  { value: 'INVOICE_ISSUED', label: 'Invoice issued' },
  { value: 'INVOICE_PAID', label: 'Invoice paid' },
  { value: 'CREDIT_NOTE_ISSUED', label: 'Credit note issued' },
  { value: 'ENTITLEMENTS_MINTED', label: 'Entitlements minted' },
  { value: 'ENTITLEMENT_SUSPENDED', label: 'Entitlement suspended' },
  { value: 'ENTITLEMENT_REVOKED', label: 'Entitlement revoked' },
  { value: 'ACCOUNT_ERASURE', label: 'Account erasure' },
  { value: 'CONSENT_WITHDRAWAL', label: 'Consent withdrawal' },
  { value: 'AUDIT_EXPORTED', label: 'Audit exported' },
  { value: 'PARTNER_ENROLLED', label: 'Partner enrolled' },
];

export const AUDIT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export type AuditPageSize = (typeof AUDIT_PAGE_SIZE_OPTIONS)[number];

export type AuditExplorerFilters = {
  action: string;
  targetType: string;
  targetId: string;
  from: string;
  to: string;
  limit: AuditPageSize;
};

export const DEFAULT_AUDIT_EXPLORER_FILTERS: AuditExplorerFilters = {
  action: '',
  targetType: '',
  targetId: '',
  from: '',
  to: '',
  limit: 50,
};

export function resolveActionFilter(value: string): AuditAction | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const byValue = AUDIT_ACTION_OPTIONS.find((option) => option.value === trimmed);
  if (byValue) {
    return byValue.value;
  }
  const normalized = trimmed.toLowerCase();
  const byLabel = AUDIT_ACTION_OPTIONS.find((option) => option.label.toLowerCase() === normalized);
  return byLabel?.value;
}

export function toAuditQueryParams(filters: AuditExplorerFilters): {
  action?: AuditAction;
  targetType?: string;
  targetId?: string;
  from?: string;
  to?: string;
  limit: number;
} {
  const action = resolveActionFilter(filters.action);
  return {
    ...(action ? { action } : {}),
    ...(filters.targetType.trim() ? { targetType: filters.targetType.trim() } : {}),
    ...(filters.targetId.trim() ? { targetId: filters.targetId.trim() } : {}),
    ...(filters.from ? { from: new Date(filters.from).toISOString() } : {}),
    ...(filters.to ? { to: new Date(filters.to).toISOString() } : {}),
    limit: filters.limit,
  };
}

export function hasActiveAuditFilters(filters: AuditExplorerFilters): boolean {
  return Boolean(
    resolveActionFilter(filters.action) ||
      filters.action.trim() ||
      filters.targetType.trim() ||
      filters.targetId.trim() ||
      filters.from ||
      filters.to ||
      filters.limit !== DEFAULT_AUDIT_EXPLORER_FILTERS.limit,
  );
}
