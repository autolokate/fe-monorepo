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

/**
 * Allowed triage moves (mirrors the server's state machine; the server still enforces it and answers
 * 409 `support_ticket_invalid_transition`). CLOSED is terminal.
 */
export const SUPPORT_TICKET_TRANSITIONS: Record<
  AdminSupportTicketStatus,
  readonly AdminSupportTicketStatus[]
> = {
  OPEN: ['IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  IN_PROGRESS: ['OPEN', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['IN_PROGRESS', 'CLOSED'],
  CLOSED: [],
};

/** Shown in place of the customer's message, which the admin plane never decrypts. */
export const SUPPORT_BODY_PRIVACY_NOTE = 'Customer message not visible to operators (privacy).';
