import type { AdminPartnerGstVerification } from '@autolokate/api-client';

import { AdminStatusChip, type AdminStatusChipTone } from '@/platform/components/AdminWowSurface';

export const PARTNER_GST_LABEL: Record<AdminPartnerGstVerification, string> = {
  NOT_SUBMITTED: 'Not submitted',
  PENDING: 'Pending',
  PENDING_REVIEW: 'Pending review',
  VERIFIED: 'Verified',
  NEEDS_ATTENTION: 'Needs attention',
};

const PARTNER_GST_TONE: Record<AdminPartnerGstVerification, AdminStatusChipTone> = {
  NOT_SUBMITTED: 'none',
  PENDING: 'draft',
  PENDING_REVIEW: 'draft',
  VERIFIED: 'active',
  NEEDS_ATTENTION: 'none',
};

/** Storefront GST state; `null` = the org has no storefront (taxi-only), so GST doesn't apply. */
export function partnerGstLabel(value: AdminPartnerGstVerification | null): string {
  return value ? PARTNER_GST_LABEL[value] : 'No storefront';
}

export function PartnerGstBadge({
  value,
  testId,
}: {
  value: AdminPartnerGstVerification | null;
  testId?: string;
}) {
  if (!value) {
    return (
      <span data-testid={testId} title="No storefront — GST does not apply">
        —
      </span>
    );
  }
  return (
    <span data-testid={testId}>
      <AdminStatusChip label={PARTNER_GST_LABEL[value]} tone={PARTNER_GST_TONE[value]} />
    </span>
  );
}
