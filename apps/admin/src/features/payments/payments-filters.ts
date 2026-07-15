import type { AdminPaymentOutcome } from '@autolokate/api-client';

export type PaymentsOutcomeFilter = AdminPaymentOutcome | 'ALL';

export type PaymentsOutcomeFilterOption = {
  value: PaymentsOutcomeFilter;
  label: string;
};

/** Outcome filters from OpenAPI `GET /admin/v1/payments` `outcome` query parameter (the coarse payment outcome). */
export const PAYMENTS_OUTCOME_FILTERS: PaymentsOutcomeFilterOption[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'UNCONFIRMED', label: 'Unconfirmed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
];

export function toPaymentsQueryOutcome(
  filter: PaymentsOutcomeFilter,
): AdminPaymentOutcome | undefined {
  return filter === 'ALL' ? undefined : filter;
}
