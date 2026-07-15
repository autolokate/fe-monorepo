import type { AdminSupportTicketStatus, AdminSupportTicketType } from '@autolokate/api-client';

export type SupportStatusFilter = AdminSupportTicketStatus | 'ALL';
export type SupportTypeFilter = AdminSupportTicketType | 'ALL';

export type SupportFilterOption<T> = {
  value: T;
  label: string;
};

/** Status filters from OpenAPI `GET /admin/v1/support/tickets` `status` query parameter. */
export const SUPPORT_STATUS_FILTERS: SupportFilterOption<SupportStatusFilter>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

/** Type filters from OpenAPI `GET /admin/v1/support/tickets` `type` query parameter. */
export const SUPPORT_TYPE_FILTERS: SupportFilterOption<SupportTypeFilter>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'LOST_QR', label: 'Lost QR' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'GENERAL', label: 'General' },
];

export function toSupportQueryStatus(
  filter: SupportStatusFilter,
): AdminSupportTicketStatus | undefined {
  return filter === 'ALL' ? undefined : filter;
}

export function toSupportQueryType(filter: SupportTypeFilter): AdminSupportTicketType | undefined {
  return filter === 'ALL' ? undefined : filter;
}
