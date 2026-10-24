import type { OwnershipClaimStatus } from '@autolokate/api-client';

import type { OwnershipClaimsStatusFilter } from '@/hooks/ownership-claims/useOwnershipClaims';

export type OwnershipClaimsFilterOption = {
  value: OwnershipClaimsStatusFilter;
  label: string;
};

export const OWNERSHIP_CLAIMS_STATUS_FILTERS: OwnershipClaimsFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'WITHDRAWN', label: 'Withdrawn' },
];

export type { OwnershipClaimStatus };
